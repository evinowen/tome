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
    let dirty = false
    let children = []

    if (!this.disabled) {
      children = this.children

      if (!this.updated || this.updated < time) {
        dirty = true
        await this.load()
      }
    }

    return { dirty, children }
  }

  async load () {
    if (this.directory) {
      await this.populate()
    } else {
      await this.read()
    }

    this.updated = Date.now()
  }

  async read () {
    const content = await window.api.file_contents(this.path)

    this.document = {
      path: this.path,
      title: await window.api.path_basename(this.path),
      content
    }
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

    this.children.splice(0, this.children.length, ...children)

    this.sort()
  }

  sort () {
    const name = (first, second) => {
      return first.path === second.path ? 0 : (first.path < second.path ? -1 : 1)
    }

    this.children.sort((first, second) => {
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
