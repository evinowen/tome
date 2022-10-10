import File, { FileRelationshipType } from './file'

export class FileIdentity {
  item: File|null
  parent: File|null = null
  index: number|null = -1
  name: string|null = null

  constructor (item: File|null = null, parent: File|null = null, index: number = -1, name: string|null = null) {
    this.item = item
    this.parent = parent
    this.index = index
    this.name = name
  }
}

export class FileIdentityContract {
  item: File
  queue: string[] = []

  constructor (item: File, queue: string[]) {
    this.item = item
    this.queue = queue
  }
}

export default class FileTree {
  base: File
  separator: string

  index = null
  crawling = 0
  timestamp = 0

  constructor (file: File, separator: string) {
    this.base = file
    this.separator = separator

    this.index = null
    this.crawling = 0
    this.timestamp = 0
  }

  async listen (listener: (data: {event: string, path: string}) => void) {
    await window.api.file.clear_subscriptions()
    window.api.file.subscribe(this.base.path || '', listener)
  }

  static async make (path: string) {
    const file = await File.make({
      path,
      relationship: FileRelationshipType.Root,
      expanded: false,
      directory: true
    })

    const separator = await window.api.path.sep()

    return new FileTree(file, separator)
  }

  static search (element: File, queue: string[]): FileIdentity|FileIdentityContract {
    const name = queue.shift()

    if (name === '') {
      return new FileIdentity(element)
    }

    if ((!element.directory) || (!element.loaded)) {
      return new FileIdentityContract(element, [name || '', ...queue])
    }

    const children = element.children
    const index = children.findIndex(child => child.name === name)

    if (index === -1) {
      return new FileIdentity(null, element, index, name)
    }

    if (queue.length > 0 && queue[0] !== '') {
      return FileTree.search(children[index], queue)
    }

    const item = children[index]
    return new FileIdentity(item, element, index)
  }

  async relative (path: string) {
    return await window.api.path.relative(this.base.path || '', path)
  }

  identify (relative: string) {
    const queue = relative.split(this.separator)

    return FileTree.search(this.base, queue)
  }
}
