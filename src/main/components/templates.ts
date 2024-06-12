import component from '@/objects/ComponentFactory'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { cloneDeep } from 'lodash'
import * as Mustache from 'mustache'
import * as mime from 'mime-types'
import { promise_with_reject } from '@/promise'

const TemplateFileType = {
  INACCESSABLE: -1,
  FILE: 0,
  DIRECTORY: 1,
}

class TemplateFile {
  name: string
  shown: boolean
  path: {
    root: string | undefined
    parent: { absolute: string | undefined, relative: string | undefined }
    target: { absolute: string | undefined, relative: string | undefined }
  }

  constructor (root, directory, name) {
    this.shown = true
    this.path = {
      root,
      parent: {
        absolute: directory,
        relative: undefined,
      },
      target: {
        absolute: undefined,
        relative: undefined,
      },
    }

    this.path.parent.relative = path.relative(this.path.root || '', this.path.parent.absolute || '')

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
      this.path.target.absolute = path.join(this.path.parent.absolute || '', this.name)
      this.path.target.relative = path.relative(this.path.root || '', this.path.target.absolute)
    } else {
      this.path.target.absolute = this.path.parent.absolute
      this.path.target.relative = this.path.parent.relative
    }
  }

  text () {
    const mime_type = mime.lookup(this.path.target.absolute || '') || 'text/plain'
    return mime_type.startsWith('text')
  }

  async type () {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const stats = await promise_with_reject<fs.Stats>(fs.lstat)(this.path.target.absolute).catch(() => {})

    if (!stats) {
      return TemplateFileType.INACCESSABLE
    }

    return stats.isDirectory() ? TemplateFileType.DIRECTORY : TemplateFileType.FILE
  }

  async read () {
    return promise_with_reject<string>(fs.readFile)(this.path.target.absolute, 'utf8')
  }

  async readdir (): Promise<fs.Dirent[]> {
    const options = { withFileTypes: true }
    return promise_with_reject<fs.Dirent[]>(fs.readdir)(this.path.target.absolute, options)
  }

  async write (content) {
    return promise_with_reject(fs.writeFile)(this.path.target.absolute, content)
  }

  async mkdir () {
    return promise_with_reject(fs.mkdir)(this.path.target.absolute)
  }

  async copy (target) {
    return promise_with_reject(fs.copyFile)(this.path.target.absolute, target)
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
  context: {
    compute: object
    config: {
      directory: boolean
      index: string | undefined
    }
  }

  source: TemplateFile
  destination: TemplateFile
  index: boolean

  constructor (source, destination, context) {
    this.source = TemplateFile.make(source)
    this.destination = TemplateFile.make(destination)

    this.context = context

    this.index = this.source.path.target.relative === (this.context.config.index || '')
  }

  static translate (input) {
    let output = input

    const today = new Date()
    const [ month, day, year ] = today.toLocaleDateString().split('/')
    const [ hour, minute, second ] = today.toLocaleTimeString().slice(0, 7).split(':')
    output = output.replaceAll('%Y', year.padStart(4, '0'))
    output = output.replaceAll('%m', month.padStart(2, '0'))
    output = output.replaceAll('%d', day.padStart(2, '0'))
    output = output.replaceAll('%H', hour.padStart(2, '0'))
    output = output.replaceAll('%i', minute.padStart(2, '0'))
    output = output.replaceAll('%s', second.padStart(2, '0'))

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
      case TemplateFileType.INACCESSABLE: {
        throw new Error(`Cannot access template source file ${this.source.path.target.absolute}`)
      }

      case TemplateFileType.DIRECTORY: {
        return await this.construct_directory()
      }

      case TemplateFileType.FILE: {
        return await this.construct_file()
      }
    }
  }

  async construct_directory () {
    const context = cloneDeep(this.context)

    const results = await this.source.readdir()

    const sources: TemplateFile[] = []

    for (const result of results) {
      const source = new TemplateFile(this.source.path.root, this.source.path.target.absolute, result.name)

      const extension = path.extname(source.path.target.absolute || '')
      if (result.isFile() && extension === '.json') {
        const content = await source.read()
        Object.assign(context.config, JSON.parse(content))
        continue
      }

      sources.push(source)
    }

    this.destination.show(this instanceof TemplateLeaf || context.config.directory)

    if (this.destination.shown) {
      switch (await this.destination.type()) {
        case TemplateFileType.FILE: {
          throw new Error(`Required directory ${this.destination.path.target.absolute} already exists as single file`)
        }

        case TemplateFileType.INACCESSABLE: {
          await this.destination.mkdir()
          break
        }
      }
    }

    let index: string | undefined

    const leafs: TemplateLeaf[] = []

    for (const source of sources) {
      const destination = new TemplateFile(this.destination.path.root, this.destination.path.target.absolute, source.name)

      const leaf = new TemplateLeaf(source, destination, context)

      if (leaf.index) {
        index = leaf.destination.path.target.absolute
      }

      leafs.push(leaf)
    }

    await Promise.all(leafs.map((leaf) => leaf.construct()))

    return index
  }

  async construct_file () {
    const { compute, config } = this.context

    switch (await this.destination.type()) {
      case TemplateFileType.DIRECTORY: {
        throw new Error(`Template file ${this.destination.path.target.absolute} already exists as a directory`)
      }

      case TemplateFileType.FILE: {
        throw new Error(`Template file ${this.destination.path.target.absolute} already exists and would be overwritten`)
      }
    }

    if (this.source.text()) {
      const raw = await this.source.read()

      const metadata = {
        config,
        source: this.source.path.target.absolute,
        desination: this.destination.path.target.absolute,
        ...compute,
      }

      const rendered = Mustache.render(raw, metadata)

      await this.destination.write(rendered)
    } else {
      await this.source.copy(this.destination.path.target.absolute)
    }

    return
  }
}

class TemplateLeaf extends Template {}

export default component('template')(
  ({ handle, log }) => {
    handle('invoke', async (source, target) => {
      const name = path.basename(source)

      const compute = {}
      const config = { index: path.join(name, 'index.md') }

      const destination = new TemplateFile(target, target, name)

      try {
        const template = new Template(source, destination, { compute, config })

        const index = await template.construct()

        return { success: true, result: index }
      } catch (error) {
        log.error(error)
        return { success: false, result: String(error) }
      }
    })
  },
)
