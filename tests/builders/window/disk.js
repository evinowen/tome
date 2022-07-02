let disk
let content = null

const split = (path) => String(path).replace(/^\./, '').replace(/^\/|\/$/, '').split('/')

export default {
  reset_disk: () => {
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
              'example.file.a.md': null,
              'example.file.b.md': null,
              'example.file.c.md': null,
              'example.directory.a': {
                'example.file.b.md': null,
                'example.file.c.md': null
              },
              'example.directory.b': { },
              '.config.json': null
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

  set_content: (value) => {
    content = value
  },

  get_content: () => {
    return content
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

      if (path_split.length) {
        current = current[name] = {}
      }

      item = item[name]
    }

    disk = replace
  }
}
