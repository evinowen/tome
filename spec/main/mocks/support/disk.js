let disk
let content

const split = (path) => String(path).replace(/^\./, '').replace(/^\/|\/$/, '').split('/')

module.exports = {
  reset_disk: () => {
    content = new Map()
    content['/project/a.md'] = 'Test    Content\n\rTest    Content\n\rTest    Content'
    content['/project/b.md'] = 'Content Content\n\rTest    Content\n\rContent Content'
    content['/project/c.md'] = 'Content Content\n\rContent Content\n\rTest    Content'
    content['/project/.tome/templates/example.template.a/config.json'] =  JSON.stringify({
      directory: false,
      map: {
        'index.md': 'index.%Y%m%d%H%i%s.md'
      }
    })

    disk = {
      'config.json': undefined,
      'library.json': undefined,
      'project': {
        '.git': {},
        '.tome': {
          'actions': {
            'example.action.a': { 'index.js': undefined },
            'example.action.b': { 'index.js': undefined },
            'example.action.c': { 'index.js': undefined }
          },
          'templates': {
            'example.template.a': {
              'config.json': undefined,
              'example.file.a.md': undefined,
              'example.file.b.md': undefined,
              'example.file.c.md': undefined,
              'example.directory.a': {
                'example.file.b.md': undefined,
                'example.file.c.md': undefined
              },
              'example.directory.b': {},
              'index.md': undefined,
              'image.png': undefined,
              'image.jpeg': undefined,
              'image.tiff': undefined
            },
            'example.template.b': undefined,
            'example.template.c': undefined
          }
        },
        'a.md': undefined,
        'b.md': undefined,
        'first': {
          'a.md': undefined,
          'b.md': undefined,
          'c.md': undefined
        },
        'second': {
          'b.md': undefined,
          'c.md': undefined
        },
        'c.md': undefined,
        'x.md': undefined,
        'y.md': undefined,
        'z.md': undefined,
        'third': {
          'c.md': undefined
        }
      }
    }
  },

  set_content: (target, value) => {
    content[target] = value
  },

  get_content: (target) => {
    return content[target] || ''
  },

  has_disk: (path) => {
    const path_split = split(path)
    let item = disk
    while (path_split.length > 0) {
      const name = path_split.shift()

      if (!item || !(name in item)) {
        return false
      }

      item = item[name]
    }

    return true
  },

  get_disk: (path) => {
    const path_split = split(path)
    let item = disk
    while (path_split.length > 0) item = item[path_split.shift()]

    return item
  },

  set_disk: (path, value) => {
    const path_split = split(path)
    let item = disk
    while (path_split.length > 1) {
      const name = path_split.shift()
      if (!item[name]) {
        item[name] = {}
      }

      item = item[name]
    }

    item[path_split.shift()] = value
  },

  unset_disk: (path) => {
    const path_split = split(path)
    const replace = {}
    let item = disk
    let current = replace
    while (path_split.length > 0) {
      const name = path_split.shift()
      let found = false
      for (const key in item) {
        if (key === name) {
          found = true
          continue
        }

        current[key] = item[key]
      }

      if (!found) {
        return
      }

      if (path_split.length > 0) {
        current = current[name] = {}
      }

      item = item[name]
    }

    disk = replace
  }
}
