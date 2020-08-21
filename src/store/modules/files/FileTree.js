import { remote } from 'electron'
import File from './File'
import lunr from 'lunr'

export default class FileTree {
  constructor (path) {
    this.base = new File({
      path,
      expanded: true,
      directory: true
    })

    this.index = null
    this.crawling = null
    this.daemon = { promise: null, status: '' }

    this.daemonize()
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

  async daemonize () {
    while (true) {
      await this.crawl()
      await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    }
  }

  async crawl () {
    const time = 1

    const documents = []

    let stack_current = []
    let stack_next = [this.base]

    this.daemon.status = 'Initialize'
    while (stack_next.length) {
      stack_current = stack_next
      stack_next = []

      while (stack_current.length) {
        const item = stack_current.shift()

        this.daemon.status = `Loading ${item.path}`
        const result = await item.crawl(time)

        if (item.document) {
          documents.push(item.document)
        }

        stack_next.push(...result)
        await new Promise((resolve, reject) => setTimeout(resolve, 50))
      }
    }

    this.daemon.status = 'Building search index ... '
    console.log('documents!', documents)

    this.index = lunr(function () {
      this.ref('title')
      this.field('content')

      documents.forEach(function (doc) { this.add(doc) }, this)
    })

    this.daemon.status = 'Ready'
  }
}
