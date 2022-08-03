import { v4 as uuidv4 } from 'uuid'

export default class File {
  static blacklist = [
    '.git',
    '.tome'
  ]

  constructor (data) {
    Object.assign(this, {
      uuid: uuidv4(),
      name: null,
      path: null,
      parent: null,
      directory: false,
      disabled: false,
      children: [],
      expanded: false,
      document: null,
      updated: null,
      clean: true,
      readonly: false,
      ...data
    })
  }

  async crawl (time) {
    if (this.disabled) {
      return
    }

    if (this.directory) {
      if (!this.updated || this.updated < time) {
        return await this.load()
      }
    }
  }

  async load () {
    const { directory } = this
    let payload

    if (directory) {
      payload = await this.populate()
    } else {
      payload = await this.read()
    }

    return { item: this, dirty: true, payload, directory }
  }

  async read () {
    const { path } = this
    const content = await window.api.file_contents(path)

    return {
      path,
      title: await window.api.path_basename(path),
      content
    }
  }

  render (document) {
    this.document = document
    this.updated = Date.now()
  }

  fill (children) {
    this.children.splice(0, this.children.length, ...children)
    this.updated = Date.now()
  }

  async populate () {
    const dirents = await window.api.file_list_directory(this.path)

    const children = []

    for (const dirent of dirents) {
      const child = this.children.find(file => file.name === dirent.name)

      if (child) {
        children.push(child)
      } else {
        children.push(await File.convert(dirent, this))
      }
    }

    File.sort(children)

    return children
  }

  static sort (children) {
    const name = (first, second) => {
      return first.path === second.path ? 0 : (first.path < second.path ? -1 : 1)
    }

    children.sort((first, second) => {
      if (first.directory && second.directory) {
        return name(first, second)
      } else if (first.directory) {
        return -1
      } else if (second.directory) {
        return 1
      } else {
        return name(first, second)
      }
    })
  }

  static async convert (dirent, parent) {
    const instance = new File({
      name: dirent.name,
      path: await window.api.path_join(parent.path, dirent.name),
      directory: dirent.directory,
      parent
    })

    await File.validate(instance)

    return instance
  }

  static async make (data) {
    const instance = new File(data)

    await File.validate(instance)

    return instance
  }

  static async validate (instance) {
    if (!this.directory && this.path) {
      this.extension = await window.api.path_extension(this.path)

      if (this.extension !== '.md') {
        this.readonly = true
      }
    }

    if (File.blacklist.indexOf(instance.name) > -1) {
      instance.disabled = true
    }
  }
}
