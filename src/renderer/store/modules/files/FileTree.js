import File from './File'

export class FileIdentity {
  constructor (item, parent = null, index = -1, name = null) {
    this.item = item
    this.parent = parent
    this.index = index
    this.name = name
  }
}

export class FileIdentityContract {
  constructor (item, queue) {
    this.item = item
    this.queue = queue
  }
}

export default class FileTree {
  constructor (file, separator) {
    this.base = file
    this.separator = separator

    this.index = null
    this.crawling = 0
    this.timestamp = 0
  }

  async listen (listener) {
    await window.api.file_clear_subscriptions()
    window.api.file_subscribe(this.base.path, listener)
  }

  static async make (path) {
    const file = await File.make({
      path,
      relationship: File.System.Root,
      expanded: false,
      directory: true
    })

    const separator = await window.api.path_sep()

    return new FileTree(file, separator)
  }

  static search (element, queue) {
    const name = queue.shift()

    if (name === '') {
      return new FileIdentity(element)
    }

    if ((!element.directory) || (!element.loaded)) {
      return new FileIdentityContract(element, [name, ...queue])
    }

    const children = element.children
    const index = children.findIndex(child => child.name === name)

    if (index === -1) {
      return new FileIdentity(null, element, index, name)
    }

    if (queue.length && queue[0] !== '') {
      return FileTree.search(children[index], queue)
    }

    const item = children[index]
    return new FileIdentity(item, element, index)
  }

  async relative (path) {
    return await window.api.path_relative(this.base.path, path)
  }

  identify (relative) {
    const queue = relative.split(this.separator)

    return FileTree.search(this.base, queue)
  }
}
