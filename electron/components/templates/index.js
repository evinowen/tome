const { ipcMain } = require('electron')

const fs = require('fs')
const path = require('path')
const Mustache = require('mustache')

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

const translate_map = (key, config) => {
  if (config?.map[key]) {
    return translate(config.map[key])
  }
}

const construct = async (base, source, destination, context, leaf = false) => {
  const { compute, config } = context
  let target = path.basename(source)

  if (target === '.config.json') {
    return
  }

  target = translate_map(path.relative(base, source), config) || target

  const source_stats = await new Promise(
    (resolve) => fs.lstat(source, (error, stats) => error ? resolve(null) : resolve(stats))
  )

  if (!source_stats) {
    throw new Error(`Cannot access template source file ${source}`)
  }

  const proposed = path.join(destination, target)

  const proposed_stats = await new Promise(
    (resolve) => fs.lstat(proposed, (error, stats) => error ? resolve(null) : resolve(stats))
  )

  if (source_stats.isDirectory()) {
    if (leaf || config.directory) {
      if (proposed_stats) {
        if (!proposed_stats.isDirectory()) {
          throw new Error(`Required directory ${proposed} already exists as single file`)
        }
      } else {
        await new Promise((resolve, reject) => fs.mkdir(proposed, (err) => err ? reject(err) : resolve(true)))
      }
    }

    const constructs = []

    const results = await new Promise(
      (resolve, reject) => fs.readdir(source, { withFileTypes: true }, (error, files) => error ? reject(error) : resolve(files))
    )

    for (const result of results) {
      constructs.push(
        construct(base, path.join(source, result.name), (leaf || config.directory) ? proposed : destination, context, true)
      )
    }

    await Promise.all(constructs)
  } else {
    if (proposed_stats) {
      throw new Error(`Template file ${proposed} already exists and would be overwritten`)
    }

    const raw = await new Promise((resolve, reject) => fs.readFile(source, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

    const rendered = Mustache.render(raw, { config, source, proposed, ...compute })

    await new Promise((resolve, reject) => fs.writeFile(proposed, rendered, (err) => err ? reject(err) : resolve(true)))
  }
}

module.exports = {
  register: () => {
    ipcMain.handle('template_invoke', async (event, source, target) => {
      const compute = { }
      const config = {}

      const source_exists = await new Promise(
        (resolve) => fs.access(source, (error) => error ? resolve(false) : resolve(true))
      )

      if (!source_exists) {
        throw new Error(`Cannot access template at ${source}`)
      }

      const source_stats = await new Promise(
        (resolve, reject) => fs.lstat(source, (error, stats) => error ? reject(error) : resolve(stats))
      )

      config.directory = source_stats.isDirectory()

      if (config.directory) {
        const config_target = path.join(source, '.config.json')
        const config_target_exists = await new Promise(
          (resolve) => fs.access(config_target, (error) => error ? resolve(false) : resolve(true))
        )

        if (config_target_exists) {
          const config_raw = await new Promise(
            (resolve, reject) => fs.readFile(config_target, 'utf8', (error, data) => error ? reject(error) : resolve(data))
          )

          Object.assign(config, JSON.parse(config_raw))
        }

        for (const key in config.compute) {
          compute[key] = translate(config.compute[key])
        }
      }

      try {
        await construct(source, source, target, { compute, config })

        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    })
  }
}
