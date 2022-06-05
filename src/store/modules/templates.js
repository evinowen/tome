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
    last: null,
    options: []
  },
  mutations: {
    load: function (state, { path, base, options }) {
      state.path = path
      state.base = base
      state.options.length = 0
      state.options.push(...options)
    },
    complete: function (state, { path }) {
      state.last = { path, timestamp: Date.now() }
    }
  },
  actions: {
    load: async function (context, { path }) {
      const base = await window.api.path_join(path, '.tome', 'templates')

      const files = await window.api.directory_list(base)

      context.commit('load', { path, base, options: files })
    },
    execute: async function (context, { name, target }) {
      if (context.state.options.indexOf(name) < 0) {
        return
      }

      const base = await window.api.path_join(context.state.base, name)

      const config = {
        directory: true
      }

      {
        const path = await window.api.path_join(base, '.config.json')

        if (await window.api.file_exists(path)) {
          const raw = await window.api.file_contents(path)

          Object.assign(config, JSON.parse(raw))
        }
      }

      const compute = {}

      for (const key in config.compute) {
        compute[key] = translate(config.compute[key])
      }

      const construct = async (source, destination, root = false) => {
        let target = await window.api.path_basename(source)

        if (target === '.config.json') {
          return
        }

        if (config.map) {
          const relative = await window.api.path_relative(base, source)

          if (config.map[relative]) {
            target = translate(config.map[relative])
          }
        }

        const proposed = await window.api.path_join(destination, target)

        // if folder, decend with contsruct
        if (await window.api.file_is_directory(source)) {
          if (!root || config.directory) {
            await window.api.file_create_directory(proposed)
          }

          const files = await window.api.file_list_directory(source)

          const constructs = []
          files.forEach(async file => constructs.push(construct(await window.api.path_join(source, file.name), (!root || config.directory) ? proposed : destination)))

          await Promise.all(constructs)
        } else {
          if (await window.api.file_exists(proposed)) {
            const raw = await window.api.file_content(source)
            const rendered = Mustache.render(raw, { config, source, proposed, ...compute })
            await window.api.file_write(proposed, rendered)
          }
        }
      }

      await construct(base, target, true)

      context.commit('complete', { path: target })
    }
  }
}
