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
      'config.json': null,
      'library.json': null,
      'project': {
        '.git': {},
        '.tome': {
          'actions': {
            'example.action.a': { 'index.js': null },
            'example.action.b': { 'index.js': null },
            'example.action.c': { 'index.js': null }
          },
          'templates': {
            'example.template.a': {
              'config.json': null,
              'example.file.a.md': null,
              'example.file.b.md': null,
              'example.file.c.md': null,
              'example.directory.a': {
                'example.file.b.md': null,
                'example.file.c.md': null
              },
              'example.directory.b': { },
              'index.md': null,
              'image.png': null,
              'image.jpeg': null,
              'image.tiff': null
            },
            'example.template.b': null,
            'example.template.c': null
          }
        },
        'a.md': null,
        'b.md': null,
        'first': {
          'a.md': null,
          'b.md': null,
          'c.md': null
        },
        'second': {
          'b.md': null,
          'c.md': null
        },
        'c.md': null,
        'x.md': null,
        'y.md': null,
        'z.md': null,
        'third': {
          'c.md': null
        }
      }
    }
  },

  set_content: (target, value) => {
    content[target] = value
  },

  get_content: (target) => {
    console.log('content!', target, content[target])
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
