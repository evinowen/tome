const { ipcMain } = require('electron')

const fs = require('fs')
const path = require('path')
const { cloneDeep } = require('lodash')
const Mustache = require('mustache')

class Template {
  constructor (base, source, destination, context) {
    this.base = base
    this.source = source
    this.destination = destination
    this.context = context
  }

  static translate (input) {
    let output = input

    const today = new Date()
    const [month, day, year] = today.toLocaleDateString().split('/')
    const [hour, minute, second] = today.toLocaleTimeString().slice(0, 7).split(':')
    output = output.replace(/%Y/g, year.padStart(4, '0'))
    output = output.replace(/%m/g, month.padStart(2, '0'))
    output = output.replace(/%d/g, day.padStart(2, '0'))
    output = output.replace(/%H/g, hour.padStart(2, '0'))
    output = output.replace(/%i/g, minute.padStart(2, '0'))
    output = output.replace(/%s/g, second.padStart(2, '0'))

    return output
  }

  static translate_map (key, config) {
    if (!key) {
      return
    }

    const { map } = config
    if (map && map[key]) {
      return Template.translate(map[key])
    }
  }

  async construct () {
    const { config = {} } = this.context

    const relative = path.relative(this.base, this.source)

    const target = Template.translate_map(relative, config) || path.basename(this.source)

    const source_stats = await new Promise(
      (resolve) => fs.lstat(this.source, (error, stats) => error ? resolve(null) : resolve(stats))
    )

    if (!source_stats) {
      throw new Error(`Cannot access template source file ${this.source}`)
    }

    if (source_stats.isDirectory()) {
      await this.construct_directory(target)
    } else {
      await this.construct_file(target)
    }
  }

  async construct_directory (target) {
    const { config = {} } = this.context

    const create = (this instanceof TemplateLeaf || config.directory)

    const proposed = create ? path.join(this.destination, target) : this.destination

    if (create) {
      const proposed_stats = await new Promise(
        (resolve) => fs.lstat(proposed, (error, stats) => error ? resolve(null) : resolve(stats))
      )

      if (proposed_stats) {
        if (!proposed_stats.isDirectory()) {
          throw new Error(`Required directory ${proposed} already exists as single file`)
        }
      } else {
        await new Promise((resolve, reject) => fs.mkdir(proposed, (err) => err ? reject(err) : resolve(true)))
      }
    }

    const results = await new Promise(
      (resolve, reject) => fs.readdir(this.source, { withFileTypes: true }, (error, files) => error ? reject(error) : resolve(files))
    )

    const context = cloneDeep(this.context)
    const leafs = []

    for (const result of results) {
      const source = path.join(this.source, result.name)
      const ext = path.extname(source)

      if (result.isFile() && ext === '.json') {
        const content = await new Promise((resolve, reject) => fs.readFile(source, 'utf8', (error, data) => error ? reject(error) : resolve(data)))
        Object.assign(context.config, JSON.parse(content))
        continue
      }

      leafs.push(result)
    }

    await Promise.all(leafs.map((leaf) => {
      const template = new TemplateLeaf(
        this.base,
        path.join(this.source, leaf.name),
        proposed,
        context
      )

      return template.construct()
    }))
  }

  async construct_file (target) {
    const { compute = {}, config = {} } = this.context

    const proposed = path.join(this.destination, target)

    const proposed_stats = await new Promise(
      (resolve) => fs.lstat(proposed, (error, stats) => error ? resolve(null) : resolve(stats))
    )

    if (proposed_stats) {
      throw new Error(`Template file ${proposed} already exists and would be overwritten`)
    }

    const raw = await new Promise((resolve, reject) => fs.readFile(this.source, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

    const rendered = Mustache.render(raw, { config, source: this.source, proposed, ...compute })

    await new Promise((resolve, reject) => fs.writeFile(proposed, rendered, (err) => err ? reject(err) : resolve(true)))
  }
}

class TemplateLeaf extends Template { }

module.exports = {
  register: () => {
    ipcMain.handle('template_invoke', async (event, source, target) => {
      const compute = {}
      const config = {}

      const source_exists = await new Promise(
        (resolve) => fs.access(source, (error) => error ? resolve(false) : resolve(true))
      )

      if (!source_exists) {
        throw new Error(`Cannot access template at ${source}`)
      }

      try {
        const template = new Template(source, source, target, { compute, config })

        await template.construct()

        return { success: true }
      } catch (error) {
        return { success: false, result: String(error) }
      }
    })
  }
}
