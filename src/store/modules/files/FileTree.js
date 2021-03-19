import { remote } from 'electron'
import File from './File'

export default class FileTree {
  constructor (path) {
    this.base = new File({
      path,
      expanded: true,
      directory: true
    })

    this.index = null
    this.crawling = null
    this.daemon = { promise: null, cycle: true, status: '' }
    this.timestamp = 0

    this.documents = []
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

  identify (path) {
    const _path = remote.require('path')

    const relative = _path.relative(this.base.path, path)
    const items = relative.split(_path.sep)

    return FileTree.search(this.base, items)
  }

  load (path) {
    const { item } = this.identify(path)

    return item.load()
  }

  populate (path) {
    const { item } = this.identify(path)

    return item.populate()
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
