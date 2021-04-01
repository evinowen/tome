import { remote } from 'electron'
import Mustache from 'mustache'

const translate = (input) => {
  let output = input

  const today = new Date()
  const [month, day, year] = today.toLocaleDateString().split('/')
  const [hour, minute, second] = today.toLocaleTimeString().slice(0, 7).split(':')
  output = output.replace(/%Y/g, year.padStart(4, '0'))
  output = output.replace(/%m/g, month.padStart(2, '0'))
  output = output.replace(/%d/g, day.padStart(2, '0'))
  output = output.replace(/%H/g, hour.padStart(2, '0'))
  output = output.replace(/%i/g, minute.padStart(2, '0'))
  output = output.replace(/%s/g, second.padStart(2, '0'))

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

      const config = {
        directory: true
      }

      {
        const path = _path.join(base, '.config.json')

        if (await new Promise((resolve, reject) => _fs.access(path, (err) => err ? resolve(false) : resolve(true)))) {
          const raw = await new Promise((resolve, reject) => _fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

          Object.assign(config, JSON.parse(raw))
        }
      }

      const compute = {}

      for (const key in config.compute) {
        compute[key] = translate(config.compute[key])
      }

      const construct = async (source, destination, root = false) => {
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
          if (!root || config.directory) {
            if (await new Promise((resolve, reject) => _fs.access(proposed, (err) => err ? resolve(true) : resolve(false)))) {
              await new Promise((resolve, reject) => _fs.mkdir(proposed, (err) => err ? reject(err) : resolve(true)))
            }
          }

          const files = await new Promise((resolve, reject) => _fs.readdir(source, (err, files) => err ? reject(err) : resolve(files)))

          const constructs = []
          files.forEach(file => constructs.push(construct(_path.join(source, file), (!root || config.directory) ? proposed : destination)))

          await Promise.all(constructs)
        } else {
          if (await new Promise((resolve, reject) => _fs.access(proposed, (err) => err ? resolve(true) : resolve(false)))) {
            const raw = await new Promise((resolve, reject) => _fs.readFile(source, 'utf8', (err, data) => err ? reject(err) : resolve(data)))
            const rendered = Mustache.render(raw, { config, source, proposed, ...compute })
            await new Promise((resolve, reject) => _fs.writeFile(proposed, rendered, (err) => err ? reject(err) : resolve(true)))
          }
        }
      }

      construct(base, target, true)
    }
  }
}
