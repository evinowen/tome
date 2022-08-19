import File from './File'

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
      expanded: true,
      directory: true
    })

    return new FileTree(file)
  }

  static async search (element, items) {
    const name = items.shift()

    if (name === '') {
      return { item: element, parent: null, name: null }
    }

    if (!element.directory) {
      return
    }

    if (!element.loaded) {
      element.fill(await element.populate())
    }

    const children = element.children
    const index = children.findIndex(child => child.name === name)

    if (index === -1) {
      return { item: null, parent: element, name: name }
    }

    if (items.length && items[0] !== '') {
      return await FileTree.search(children[index], items)
    }

    return { item: children[index], parent: element, index }
  }

  async identify (path) {
    const relative = await window.api.path_relative(this.base.path, path)
    const items = relative.split(await window.api.path_sep())

    return await FileTree.search(this.base, items)
  }

  async load (path) {
    const { item } = await this.identify(path)

    return item ? await item.load() : null
  }

  async * crawl () {
    const time = Date.now()
    const crawl = ++this.crawling

    let dirty = false
    let stack_current = []
    let stack_next = [this.base]

    while (crawl === this.crawling && stack_next.length) {
      stack_current = stack_next
      stack_next = []

      while (crawl === this.crawling && stack_current.length) {
        const item = stack_current.shift()

        const result = await item.crawl(time)

        if (result) {
          dirty = result.dirty || dirty

          if (result.directory) {
            stack_next.push(...result.payload)
          }

          yield result
        }
      }
    }

    if (crawl === this.crawling && dirty) {
      this.timestamp = Date.now()
    }
  }
}
