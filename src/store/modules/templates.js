import { remote } from 'electron'

const translate = (input) => {
  let output = input

  const today = new Date()
  const [month, day, year] = today.toLocaleDateString().split('/')
  const [hour, minute, second] = today.toLocaleTimeString().slice(0, 7).split(':')
  output = output.replace(/%Y/g, year)
  output = output.replace(/%m/g, month)
  output = output.replace(/%d/g, day)
  output = output.replace(/%H/g, hour)
  output = output.replace(/%i/g, minute)
  output = output.replace(/%s/g, second)

  return output
}

export default {
  namespaced: true,
  state: {
    path: null,
    base: null,
    options: []
  },
  mutations: {
    load: function (state, { path, base, options }) {
      state.path = path
      state.base = base
      state.options.length = 0
      state.options.push(...options)
    }
  },
  actions: {
    load: async function (context, { path }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

      const base = _path.join(path, '.tome', 'templates')

      try {
        const stats = await new Promise((resolve, reject) => _fs.lstat(base, (err, stats) => err ? reject(err) : resolve(stats)))

        if (!stats.isDirectory()) {
          console.log('No .tome/templates directory')
          return
        }
      } catch (error) {
        return
      }

      const files = await new Promise((resolve, reject) => _fs.readdir(base, (err, files) => err ? reject(err) : resolve(files)))

      context.commit('load', { path, base, options: files })
    },
    execute: async function (context, { name, target }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

      if (context.state.options.indexOf(name) < 0) {
        return
      }

      const base = _path.join(context.state.base, name)

      const config = {}

      {
        const path = _path.join(base, '.config.json')

        if (await new Promise((resolve, reject) => _fs.access(path, (err) => err ? resolve(false) : resolve(true)))) {
          const raw = await new Promise((resolve, reject) => _fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

          Object.assign(config, JSON.parse(raw))
        }
      }

      const construct = async (source, destination) => {
        const stats = await new Promise((resolve, reject) => _fs.lstat(source, (err, stats) => err ? reject(err) : resolve(stats)))

        let target = _path.basename(source)

        if (target === '.config.json') {
          return
        }

        if (config.map) {
          const relative = _path.relative(base, source)

          if (config.map[relative]) {
            target = translate(config.map[relative])
          }
        }

        const proposed = _path.join(destination, target)

        // if folder, decend with contsruct
        if (stats.isDirectory()) {
          if (await new Promise((resolve, reject) => _fs.access(proposed, (err) => err ? resolve(true) : resolve(false)))) {
            await new Promise((resolve, reject) => _fs.mkdir(proposed, (err) => err ? reject(err) : resolve(true)))
          } else {
            console.log('file already exists ->', proposed)
          }

          const files = await new Promise((resolve, reject) => _fs.readdir(source, (err, files) => err ? reject(err) : resolve(files)))

          const constructs = []
          files.forEach(file => constructs.push(construct(_path.join(source, file), _path.join(destination, target))))

          await Promise.all(constructs)
        } else {
          if (await new Promise((resolve, reject) => _fs.access(proposed, (err) => err ? resolve(true) : resolve(false)))) {
            await new Promise((resolve, reject) => _fs.copyFile(source, proposed, 0, (error) => error ? reject(error) : resolve(true)))
          } else {
            console.log('file already exists ->', proposed)
          }
        }
      }

      construct(base, target)
    }
  }
}
