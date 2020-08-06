import { remote } from 'electron'
import { v4 as uuidv4 } from 'uuid'

export default class FileTree {
  constructor (path) {
    this.path = path
    this.expanded = true
    this.directory = true
    this.populated = false
    this.children = []
  }

  identify (path) {
    console.log('identify', this.path, path)
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
      return { item: element }
    }

    const children = element.children
    const index = children.findIndex(child => child.name === name)

    if (index === -1) {
      console.log('search failed', 'name', name)
      console.log('search failed', 'children', children)
      children.forEach(child => console.log(Object.assign({}, child)))
      return null
    }

    if (items.length && items[0] !== '') {
      return this.search(children[index], items)
    }

    return { item: children[index], parent: element, index }
  }

  sort (path) {
    const item = this.identify(path)

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
      directory: false,
      children: [],
      templates: [],
      actions: [],
      expanded: false,
      ...data
    }
  }

  mapper (path) {
    return (data) => {
      const _path = remote.require('path')
      const item = this.make({
        name: data.name,
        path: _path.join(path, data.name),
        directory: data.isDirectory()
      })

      switch (_path.extname(data.name).toLowerCase()) {
        case '.md':
          Object.assign(item, { icon: 'mdi-file-code', disabled: false, color: 'blue' })
          break

        case '.gif':
        case '.jpg':
        case '.jpeg':
        case '.png':
          Object.assign(item, { icon: 'mdi-file-image', disabled: true, color: 'green' })
          break

        default:
          Object.assign(item, { icon: 'mdi-file-remove', disabled: true })
          break
      }

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
