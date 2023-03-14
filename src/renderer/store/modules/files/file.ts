import { v4 as uuidv4 } from 'uuid'

export class FileDirent {
  static async convert (dirent: { name: string, mime: string, directory: boolean }, parent: File, base: File) {
    const path = await window.api.path.join(parent.path, dirent.name)
    const relative = await window.api.path.relative(base.path, path)
    const extension = await window.api.path.extension(path)

    const file = new File({
      name: dirent.name,
      mime: dirent.mime,
      path,
      relative,
      extension,
      directory: dirent.directory,
      parent
    })

    await File.relate(file)

    return file
  }
}

export interface FileDocument {
  path: string
  title: string
  content: string
}

export class FileLoadPayload {
  children?: File[] = []
  document?: FileDocument
}

export class FileLoadContract {
  item: File
  payload: FileLoadPayload

  constructor (item: File, payload: FileLoadPayload) {
    this.item = item
    this.payload = payload
  }
}

interface FileConstructor {
  uuid?: string
  name?: string
  extension?: string
  mime?: string
  path?: string
  relative?: string
  relationship?: FileRelationshipType,
  parent?: File
  loaded?: boolean
  directory?: boolean
  disabled?: boolean
  children?: File[]
  ghost?: File
  expanded?: boolean
  ephemeral?: boolean
  document?: FileDocument
  updated?: number
  clean?: boolean
  readonly?: boolean
}

export enum FileRelationshipType {
  None = '',
  Root = 'root',
  Git = 'git',
  Tome = 'tome',
  TomeFeatureTemplates = 'tome-feature-templates',
  TomeFeatureActions = 'tome-feature-actions',
  TomeTemplate = 'tome-template',
  TomeAction = 'tome-action',
  TomeFile = 'tome-file'
}

class FileRelationship {
  base?: FileRelationshipType

  map?: {
    base?: FileRelationshipType,
    child?: FileRelationshipType,
    descendant?: FileRelationshipType
  }

  children?: {
    [name: string]: FileRelationshipMember
  }
}

type FileRelationshipMember = FileRelationship|FileRelationshipType

export default class File {
  uuid: string = uuidv4()
  name: string
  extension = ''
  mime = ''
  path = ''
  relative: string
  relationship = FileRelationshipType.None
  parent?: File
  loaded = false
  directory = false
  disabled = false
  children: File[] = []
  ghost?: File
  expanded = false
  ephemeral = false
  document: FileDocument = {
    path: '',
    title: '',
    content: ''
  }
  updated?: number
  clean = true
  readonly = false
  image = false

  static Empty:File = new File({})

  static blacklist = [
    '.git',
    '.tome'
  ]

  static System = {
    Root: 'root',
    Git: 'git',
    Tome: 'tome',
    TomeFeatureTemplates: 'tome-feature-templates',
    TomeFeatureActions: 'tome-feature-actions',
    TomeTemplate: 'tome-template',
    TomeAction: 'tome-action',
    TomeFile: 'tome-file'
  }

  static Relationships:FileRelationship = {
    base: FileRelationshipType.Root,
    children: {
      '.git': FileRelationshipType.Git,
      '.tome': {
        map: {
          base: FileRelationshipType.Tome,
          descendant: FileRelationshipType.TomeFile
        },
        children: {
          'templates': {
            map: {
              base: FileRelationshipType.TomeFeatureTemplates,
              child: FileRelationshipType.TomeTemplate
            }
          },
          'actions': {
            base: FileRelationshipType.TomeFeatureActions,
            map: {
              base: FileRelationshipType.TomeFeatureTemplates,
              child: FileRelationshipType.TomeAction
            }
          }
        }
      }
    }
  }

  constructor (data: FileConstructor) {
    Object.assign(this, data)
    this.image = this.mime.startsWith('image')
  }

  async load (base: File, listener?: CallableFunction) {
    const { directory } = this

    const payload = new FileLoadPayload
    if (directory) {
      payload.children = await this.populate(base, listener)
    } else {
      payload.document = await this.read(listener)
    }

    return new FileLoadContract(this, payload)
  }

  async open (container: boolean) {
    await window.api.file.open(this.path, container)
  }

  async read (listener?: CallableFunction) {
    const { path } = this
    const content = await window.api.file.contents(path)
    listener({ type: 'read', path, bytes: new Blob([content]).size })

    return {
      path,
      title: await window.api.path.basename(path),
      content
    }
  }

  render (payload: FileLoadPayload) {
    this.loaded = true
    this.document = payload.document
    this.updated = Date.now()
  }

  fill (payload: FileLoadPayload) {
    this.loaded = true
    this.children.splice(0, this.children.length, ...payload.children)
    this.updated = Date.now()
  }

  haunt (directory = false, sibling) {
    this.ghost = new File({ parent: this, ephemeral: true, directory })

    let index = this.children.length

    if (sibling) {
      const sibling_index = this.children.indexOf(sibling)
      if (sibling_index >= 0) {
        index = sibling_index + 1
      }
    }

    this.children.splice(index, 0, this.ghost)

    return this.ghost
  }

  exercise () {
    if (this.ghost === undefined) {
      return
    }

    const index = this.children.indexOf(this.ghost)

    if (index > -1) {
      this.children.splice(index, 1)
    }

    this.ghost = undefined
  }

  async populate (base: File, listener?: CallableFunction) {
    const dirents = await window.api.file.list_directory(this.path)

    const children = []

    for (const dirent of dirents) {
      let child = this.children.find(file => file.name === dirent.name)

      if (!child) {
        child = await FileDirent.convert(dirent, this, base)
      }

      listener({ type: 'populated', path: child.path })
      children.push(child)
    }

    File.sort(children)

    return children
  }

  async create (name: string, directory = false) {
    const path = await window.api.path.join(this.path, name)
    let result = false

    directory
      ? result = await window.api.file.create_directory(path)
      : result = await window.api.file.create(path)

    if (!result) {
      throw new Error(`Failed to create ${name} under directory ${this.path}`)
    }

    return path
  }

  async rename (basename: string) {
    const dirname = await window.api.path.dirname(this.path)

    const path = await window.api.path.join(dirname, basename)

    await window.api.file.rename(this.path, path)

    return path
  }

  async move (target: string) {
    const basename = await window.api.path.basename(this.path)
    const path = await window.api.path.join(target, basename)

    await window.api.file.rename(this.path, path)

    return path
  }

  async write (content: string) {
    await window.api.file.write(this.path, content)
  }

  async delete () {
    await window.api.file.delete(this.path)
  }

  static sort (children: File[]) {
    children.sort((first, second) => {
      if (first.directory && second.directory) {
        return File.sort_compare(first, second)
      } else if (first.directory) {
        return -1
      } else if (second.directory) {
        return 1
      } else {
        return File.sort_compare(first, second)
      }
    })
  }

  static sort_compare (first: File, second: File) {
    if ((first.path) === (second.path)) {
      return 0
    }

    return ((first.path)  < (second.path) ? -1 : 1)
  }

  static async relate (instance: File) {
    let node: FileRelationshipMember = File.Relationships
    const items = (instance.relative || '').split(await window.api.path.sep())

    const assign: { base: FileRelationshipMember, child: FileRelationshipMember, descendant: FileRelationshipMember } = {
      base: undefined,
      child: undefined,
      descendant: undefined
    }

    while (items.length > 0) {
      const item = items.shift()

      if (!item) {
        break
      }


      if (typeof node === 'string' || node instanceof String) {
        node = undefined
        break
      }

      assign.child = undefined

      if (node.map) {
        const { descendant, child } = node.map

        if (child) {
          assign.child = child
        }

        if (descendant) {
          assign.descendant = descendant
        }
      }

      if (!(node.children && node.children[item])) {
        node = undefined
        break
      }

      node = node.children[item]
      if (node === undefined) {
        break
      }
    }

    if (node) {
      assign.base = node
    }

    if (items.length > 0) {
      assign.child = undefined
    }

    instance.relationship = File.evaluate(assign.base, assign.child, assign.descendant)
  }

  static evaluate (...nodes: FileRelationshipMember[]): FileRelationshipType | undefined {
    for (const node of nodes) {
      if (!node) {
        continue
      }

      if (typeof node === 'object') {
        const { map } = node

        if (map && map.base) {
          return map.base
        }
      } else {
        return node
      }
    }
  }
}
