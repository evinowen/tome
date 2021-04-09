import { remote } from 'electron'
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
      ...data
    })

    if (!this.directory && this.path) {
      const _path = remote.require('path')
      this.extension = _path.extname(this.path).toLowerCase()
    }
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

  load () {
    if (this.directory) {
      this.populate()
    } else {
      this.read()
    }

    this.updated = Date.now()
  }

  read () {
    const _fs = remote.require('fs')

    const content = _fs.readFileSync(this.path, 'utf8')

    const _path = remote.require('path')

    this.document = {
      path: this.path,
      title: _path.basename(this.path),
      content
    }
  }

  populate () {
    const _fs = remote.require('fs')

    const dirents = _fs.readdirSync(this.path, { withFileTypes: true })

    const children = []

    for (const dirent of dirents) {
      const child = this.children.find(file => file.name === dirent.name)

      if (child) {
        children.push(child)
      } else {
        children.push(File.convert(dirent, this))
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

  static convert (dirent, parent) {
    const _path = remote.require('path')

    const instance = new File({
      name: dirent.name,
      path: _path.join(parent.path, dirent.name),
      directory: dirent.isDirectory(),
      parent
    })

    if (File.blacklist.indexOf(dirent.name) > -1) {
      instance.disabled = true
    }

    return instance
  }
}
