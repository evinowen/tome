class DiskFile {
  directory = false
  children?: Map<string, DiskFile>

  constructor(children?: Record<string, DiskFile>) {
    if (children !== undefined) {
      this.directory = true
      this.children = new Map<string, DiskFile>

      this.reset(children)
    }
  }

  has(key) {
    return this.children.has(key)
  }

  get(key) {
    return this.children.get(key)
  }

  set(key, value) {
    return this.children.set(key, value)
  }

  delete(key) {
    return this.children.delete(key)
  }

  reset(children: Record<string, DiskFile>) {
    this.children.clear()

    for (const [name, file] of Object.entries<DiskFile>(children)) {
      this.children.set(name, file)
    }
  }
}

export const split = (path) => String(path).replace(/^\./, '').replace(/^\/|\/$/, '').split('/')
export const file = (children?: Record<string, DiskFile>): DiskFile => {
  return new DiskFile(children)
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export default class Disk {
  files: DiskFile = new DiskFile({})
  content: Map<string, string> = new Map()
  content_default = ''

  reset_disk () {
    this.content.clear()
    this.content.set('/project/a.md', 'Test    Content\n\rTest    Content\n\rTest    Content')
    this.content.set('/project/b.md', 'Content Content\n\rTest    Content\n\rContent Content')
    this.content.set('/project/c.md', 'Content Content\n\rContent Content\n\rTest    Content')
    this.content.set('/project/.tome/templates/example.template.a/config.json', JSON.stringify({
      directory: false,
      map: {
        'index.md': 'index.%Y%m%d%H%i%s.md'
      }
    }))

    this.files.reset({
      'config.json': file(),
      'library.json': file(),
      'project': file({
        '.git': file({}),
        '.tome': file({
          'actions': file({
            'example.action.a': file({ 'index.js': file() }),
            'example.action.b': file({ 'index.js': file() }),
            'example.action.c': file({ 'index.js': file() })
          }),
          'templates': file({
            'example.template.a': file({
              'config.json': file(),
              'example.file.a.md': file(),
              'example.file.b.md': file(),
              'example.file.c.md': file(),
              'example.directory.a': file({
                'example.file.b.md': file(),
                'example.file.c.md': file()
              }),
              'example.directory.b': file({}),
              'index.md': file(),
              'image.png': file(),
              'image.jpeg': file(),
              'image.tiff': file()
            }),
            'example.template.b': file(),
            'example.template.c': file()
          })
        }),
        'a.md': file(),
        'b.md': file(),
        'first': file({
          'a.md': file(),
          'b.md': file(),
          'c.md': file()
        }),
        'second': file({
          'b.md': file(),
          'c.md': file()
        }),
        'c.md': file(),
        'x.md': file(),
        'y.md': file(),
        'z.md': file(),
        'third': file({
          'c.md': file()
        })
      })
    })

    return { files: this.files, content: this.content }
  }

  set_content (target, value) {
    this.content.set(target, value)

    return false
  }

  set_content_default (value) {
    this.content_default = value

    return false
  }

  get_content (target) {
    return this.content.get(target) || this.content_default
  }

  has_disk (path) {
    const path_split = split(path)
    let item = this.files
    while (path_split.length > 0) {
      const name = path_split.shift()

      if (item && item.has(name)) {
        item = item.get(name)
      } else {
        return false
      }
    }

    return true
  }

  get_disk (path) {
    const path_split = split(path)
    let item = this.files
    while (path_split.length > 0) {
      const name = path_split.shift()

      item = item.get(name)
    }

    return item
  }

  set_disk (path, value?) {
    const path_split = split(path)
    let item = this.files
    while (path_split.length > 1) {
      const name = path_split.shift()

      if (!item.has(name)) {
        item.set(name, file({}))
      }

      item = item.get(name)
    }

    item.set(path_split.shift(), value || file())

    return false
  }

  unset_disk (path) {
    const path_split = split(path)
    let item = this.files
    while (path_split.length > 1) {
      item = item.get(path_split.shift())
    }

    item.delete(path_split.shift())

    return false
  }
}
