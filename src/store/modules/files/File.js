import { v4 as uuidv4 } from 'uuid'

export class FileDirent {
  static async convert (dirent, parent) {
    const path = await window.api.path_join(parent.path, dirent.name)
    const relative = await window.api.path_relative(parent.base.path, path)

    const file = new File({
      name: dirent.name,
      path,
      relative,
      directory: dirent.directory,
      parent,
      base: parent.base
    })

    await File.relate(file)

    return file
  }
}

export class FileLoadContract {
  constructor (item, payload) {
    this.item = item
    this.payload = payload
  }
}

export default class File {
  static blacklist = [
    '.git',
    '.tome'
  ]

  static System = {
    Root: 'root',
    Git: 'git',
    Tome: 'tome',
    TomeTemplates: 'tome-templates',
    TomeActions: 'tome-actions'
  }

  static Relationships = {
    base: File.System.Root,
    children: {
      '.git': File.System.Git,
      '.tome': {
        base: File.System.Tome,
        children: {
          'templates': File.System.TomeTemplates,
          'actions': File.System.TomeActions
        }
      }
    }
  }

  constructor (data) {
    Object.assign(this, {
      uuid: uuidv4(),
      name: null,
      path: null,
      relative: null,
      parent: null,
      base: null,
      loaded: false,
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

  async load () {
    const { directory } = this
    let payload

    if (directory) {
      payload = await this.populate()
    } else {
      payload = await this.read()
    }

    return new FileLoadContract(this, payload)
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
    this.loaded = true
    this.document = document
    this.updated = Date.now()
  }

  fill (children) {
    this.loaded = true
    this.children.splice(0, this.children.length, ...children)
    this.updated = Date.now()
  }

  haunt (directory = false, sibling = null) {
    this.ghost = new File({ parent: this, ephemeral: true, directory })

    let index = this.children.length

    if (sibling) {
      const sibling_index = this.children.indexOf(sibling)
      if (sibling_index >= 0) {
        index = sibling_index + 1
      }
    }

    this.children.splice(index, 0, this.ghost)

    return this.ghost
  }

  exercise () {
    const index = this.children.indexOf(this.ghost)

    if (index > -1) {
      this.children.splice(index, 1)
    }

    this.ghost = null
  }

  async populate () {
    const dirents = await window.api.file_list_directory(this.path)

    const children = []

    for (const dirent of dirents) {
      const child = this.children.find(file => file.name === dirent.name)

      if (child) {
        children.push(child)
      } else {
        children.push(await FileDirent.convert(dirent, this))
      }
    }

    File.sort(children)

    return children
  }

  async create (name, directory = false) {
    const path = await window.api.path_join(this.path, name)

    let result = false

    if (directory) {
      result = await window.api.file_create_directory(path)
    } else {
      result = await window.api.file_create(path)
    }

    if (!result) {
      throw new Error(`Failed to create ${name} under directory ${this.path}`)
    }

    return path
  }

  async rename (basename) {
    const dirname = await window.api.path_dirname(this.path)
    const path = await window.api.path_join(dirname, basename)

    await window.api.file_rename(this.path, path)

    return path
  }

  async move (target) {
    const basename = await window.api.path_basename(this.path)
    const dirname = await window.api.path_dirname(target)
    const path = await window.api.path_join(dirname, basename)

    await window.api.file_rename(this.path, path)

    return path
  }

  async write (content) {
    await window.api.file_write(this.path, content)

    return { item: this, directory: false, content }
  }

  async delete () {
    await window.api.file_delete(this.path)
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

  static async make (data) {
    const instance = new File(data)

    instance.base = instance

    return instance
  }

  static async relate (instance) {
    let relationship = File.Relationships
    const items = instance.relative.split(await window.api.path_sep())

    do {
      const item = items.shift()

      if (typeof relationship === 'string' || relationship instanceof String) {
        return
      }

      const children = relationship.children

      if (!children[item]) {
        return
      }

      relationship = children[item]
    } while (items.length)

    if (!relationship) {
      return
    }

    if (typeof relationship === 'string' || relationship instanceof String) {
      instance.relationship = relationship
    } else {
      instance.relationship = relationship.base
    }
  }
}
