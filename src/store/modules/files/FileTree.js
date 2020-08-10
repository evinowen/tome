import { remote } from 'electron'
import { v4 as uuidv4 } from 'uuid'

export default class FileTree {
  constructor (path) {
    Object.assign(this, this.make({
      path,
      expanded: true,
      directory: true
    }))
  }

  identify (path) {
    const _path = remote.require('path')

    if (String(path).indexOf(this.path) !== 0) {
      return null
    }

    const relative = _path.relative(this.path, path)
    const items = relative.split(_path.sep)

    return this.search(this, items)
  }

  search (element, items) {
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
      return this.search(children[index], items)
    }

    return { item: children[index], parent: element, index }
  }

  sort (path) {
    const { item } = this.identify(path)

    if (!item) return false

    item.children.sort((first, second) => {
      const name = (first, second) => {
        return first.path === second.path ? 0 : (first.path < second.path ? -1 : 1)
      }

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

    return true
  }

  make (data) {
    return {
      uuid: uuidv4(),
      name: null,
      path: null,
      parent: null,
      directory: false,
      disabled: true,
      children: [],
      templates: [],
      actions: [],
      expanded: false,
      ...data
    }
  }

  mapper (parent) {
    return (data) => {
      const _path = remote.require('path')
      const item = this.make({
        name: data.name,
        path: _path.join(parent.path, data.name),
        directory: data.isDirectory(),
        parent
      })

      if (item.directory) {
        item.children = []
        if (!['.git'].includes(item.name)) {
          item.disabled = false
        }
      }

      return item
    }
  }
}
