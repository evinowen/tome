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
    const _fs = remote.require('fs')

    const content = await new Promise((resolve, reject) => _fs.readFile(this.path, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

    const _path = remote.require('path')

    this.document = {
      path: this.path,
      title: _path.basename(this.path),
      content
    }
  }

  async populate () {
    const _fs = remote.require('fs')

    const files = await new Promise((resolve, reject) => _fs.readdir(
      this.path,
      { withFileTypes: true },
      (err, files) => err ? reject(err) : resolve(files)
    ))

    this.children.length = 0
    this.children.push(...files.map(file => File.convert(file, this)))
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
