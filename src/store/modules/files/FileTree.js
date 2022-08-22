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
  constructor (file) {
    this.base = file

    this.index = null
    this.crawling = 0
    this.timestamp = 0
  }

  static async make (path) {
    const file = await File.make({
      path,
      expanded: false,
      directory: true
    })

    return new FileTree(file)
  }

  static async search (element, queue) {
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
      return await FileTree.search(children[index], queue)
    }

    const item = children[index]
    return new FileIdentity(item, element, index)
  }

  async identify (path) {
    const relative = await window.api.path_relative(this.base.path, path)
    const queue = relative.split(await window.api.path_sep())

    return await FileTree.search(this.base, queue)
  }
}
