const { ipcMain } = require('electron')

const fs = require('fs')
const path = require('path')
const { cloneDeep } = require('lodash')
const Mustache = require('mustache')
const { dir } = require('console')

const TemplateFileType = {
  INACCESSABLE: -1,
  FILE: 0,
  DIRECTORY: 1
}

class TemplateFile {
  constructor (root, directory, name) {
    this.shown = true
    this.path = {
      root,
      parent: {
        absolute: directory,
        relative: null
      },
      target: {
        absolute: null,
        relative: null
      }
    }

    this.path.parent.relative = path.relative(this.path.root, this.path.parent.absolute)

    this.target(name)
  }

  target (name) {
    this.name = name
    this.refresh()
  }

  show (shown) {
    this.shown = shown
    this.refresh()
  }

  refresh () {
    if (this.shown) {
      this.path.target.absolute = path.join(this.path.parent.absolute, this.name)
      this.path.target.relative = path.relative(this.path.root, this.path.target.absolute)
    } else {
      this.path.target.absolute = this.path.parent.absolute
      this.path.target.relative = this.path.parent.relative
    }
  }

  async type () {
    const stats = await new Promise(
      (resolve) => fs.lstat(this.path.target.absolute, (error, stats) => error ? resolve(null) : resolve(stats))
    )

    if (!stats) {
      return TemplateFileType.INACCESSABLE
    }

    return stats.isDirectory() ? TemplateFileType.DIRECTORY : TemplateFileType.FILE
  }

  async read () {
    return await new Promise(
      (resolve, reject) => fs.readFile(this.path.target.absolute, 'utf8', (error, data) => error ? reject(error) : resolve(data))
    )
  }

  async readdir () {
    const options = { withFileTypes: true }
    return await new Promise(
      (resolve, reject) => fs.readdir(this.path.target.absolute, options, (error, files) => error ? reject(error) : resolve(files))
    )
  }

  async write (content) {
    return await new Promise(
      (resolve, reject) => fs.writeFile(this.path.target.absolute, content, (error) => error ? reject(error) : resolve(true))
    )
  }

  async mkdir () {
    return await new Promise(
      (resolve, reject) => fs.mkdir(this.path.target.absolute, (error) => error ? reject(error) : resolve(true))
    )
  }

  static make (target) {
    if (target instanceof TemplateFile) {
      return target
    }

    const name = path.basename(target)
    const directory = path.dirname(target)

    return new TemplateFile(directory, directory, name)
  }
}

class Template {
  constructor (source, destination, context) {
    this.source = TemplateFile.make(source)
    this.destination = TemplateFile.make(destination)

    this.context = context

    this.index = this.source.path.target.relative === this.context.config.index
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
    const translate_name = Template.translate_map(this.source.name, this.context.config)
    const translate_relative = Template.translate_map(this.source.name, this.context.config)

    const target = translate_relative || translate_name || this.source.name

    this.destination.target(target)

    switch (await this.source.type()) {
      case TemplateFileType.INACCESSABLE:
        throw new Error(`Cannot access template source file ${this.source.path.target.absolute}`)

      case TemplateFileType.DIRECTORY:
        return await this.construct_directory()

      case TemplateFileType.FILE:
        return await this.construct_file()
    }
  }

  async construct_directory () {
    const context = cloneDeep(this.context)

    const results = await this.source.readdir()

    const sources = []

    for (const result of results) {
      const source = new TemplateFile(this.source.path.root, this.source.path.target.absolute, result.name)

      const ext = path.extname(source.path.target.absolute)
      if (result.isFile() && ext === '.json') {
        const content = await source.read()
        Object.assign(context.config, JSON.parse(content))
        continue
      }

      sources.push(source)
    }

    this.destination.show(this instanceof TemplateLeaf || context.config.directory)

    if (this.destination.shown) {
      switch (await this.destination.type()) {
        case TemplateFileType.FILE:
          throw new Error(`Required directory ${this.destination.path.target.absolute} already exists as single file`)

        case TemplateFileType.INACCESSABLE:
          await this.destination.mkdir()
          break
      }
    }

    let index = null

    const leafs = []

    for (const source of sources) {
      const destination = new TemplateFile(this.destination.path.root, this.destination.path.target.absolute, source.name)

      const leaf = new TemplateLeaf(source, destination, context)

      if (leaf.index) {
        index = leaf
      }

      leafs.push(leaf)
    }

    await Promise.all(leafs.map((leaf) => leaf.construct()))

    return index?.destination.path.target.absolute
  }

  async construct_file () {
    const { compute = {}, config = {} } = this.context

    switch (await this.destination.type()) {
      case TemplateFileType.DIRECTORY:
        throw new Error(`Template file ${this.destination.path.target.absolute} already exists as a directory`)

      case TemplateFileType.FILE:
        throw new Error(`Template file ${this.destination.path.target.absolute} already exists and would be overwritten`)
    }

    const raw = await this.source.read()

    const metadata = {
      config,
      source: this.source.path.target.absolute,
      desination: this.destination.path.target.absolute,
      ...compute
    }

    const rendered = Mustache.render(raw, metadata)

    await this.destination.write(rendered)

    return null
  }
}

class TemplateLeaf extends Template { }

module.exports = {
  register: () => {
    ipcMain.handle('template_invoke', async (event, source, target) => {
      const name = path.basename(source)

      const compute = {}
      const config = { index: path.join(name, 'index.md') }

      const destination = new TemplateFile(target, target, name)

      try {
        const template = new Template(source, destination, { compute, config })

        const index = await template.construct()

        return { success: true, result: index }
      } catch (error) {
        return { success: false, result: String(error) }
      }
    })
  }
}
