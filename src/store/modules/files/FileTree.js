import File from './File'

export default class FileTree {
  constructor (file) {
    this.base = file

    this.index = null
    this.crawling = null
    this.daemon = { promise: null, cycle: true, status: '' }
    this.timestamp = 0

    this.documents = []
  }

  static async make (path) {
    const file = await File.make({
      path,
      expanded: true,
      directory: true
    })

    return new FileTree(file)
  }

  static search (element, items) {
    const name = items.shift()

    if (name === '') {
      return { item: element, parent: null, name: null }
    }

    const children = element.children
    const index = children.findIndex(child => child.name === name)

    if (index === -1) {
      return { item: null, parent: element, name: name }
    }

    if (items.length && items[0] !== '') {
      return FileTree.search(children[index], items)
    }

    return { item: children[index], parent: element, index }
  }

  async identify (path) {
    const relative = await window.api.path_relative(this.base.path, path)
    const items = relative.split(await window.api.path_sep())

    return FileTree.search(this.base, items)
  }

  async load (path) {
    const { item } = await this.identify(path)

    return item ? item.load() : null
  }

  async populate (path) {
    const { item } = await this.identify(path)

    return item ? item.populate() : null
  }

  async crawl () {
    const time = Date.now()

    if (this.crawling) {
      this.daemon.cycle = false
      await this.daemon.promise
    }

    this.crawling = true

    this.daemon.cycle = true
    this.daemon.status = 'Initialize'

    this.daemon.promise = (async () => {
      const documents = []

      let dirty = false
      let stack_current = []
      let stack_next = [this.base]

      while (this.daemon.cycle && stack_next.length) {
        stack_current = stack_next
        stack_next = []

        while (this.daemon.cycle && stack_current.length) {
          const item = stack_current.shift()

          this.daemon.status = `Loading ${item.path}`
          const result = await item.crawl(time)

          dirty = result.dirty || dirty

          if (item.document) {
            documents.push(item.document)
          }

          stack_next.push(...result.children)
        }
      }

      if (this.daemon.cycle) {
        if (dirty) {
          this.documents = documents
          this.timestamp = Date.now()
        }

        this.daemon.cycle = false
        this.daemon.status = 'Ready'
      } else {
        this.daemon.status = 'Terminated'
      }

      this.crawling = false
    })()

    return this.daemon.promise
  }
}
