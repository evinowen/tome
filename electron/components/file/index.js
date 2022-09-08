const { ipcMain, dialog, shell, BrowserWindow } = require('electron')

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

const search = {
  target: null,
  criteria: null,
  files: []
}

const excluded_filenames = [
  '.git',
  '.tome'
]

let watcher = null

module.exports = {
  register: (win) => {
    ipcMain.on('file_subscribe', (event, target) => {
      const relay = (event, path) => {
        win.webContents.send('file_subscription_update', { event, path })
      }

      const options = {
        cwd: target,
        ignored: ['.git'],
        ignoreInitial: true
      }

      watcher = chokidar.watch(target, options).on('all', relay)
    })

    ipcMain.handle('file_clear_subscriptions', async (event) => {
      if (watcher) {
        await watcher.close()
      }
    })

    ipcMain.handle('file_exists', async (event, target) =>
      new Promise((resolve, reject) => fs.access(target, (error, data) => error ? resolve(false) : resolve(true))))

    ipcMain.handle('file_is_directory', async (event, target) => {
      const stats = await new Promise((resolve, reject) => fs.lstat(target, (err, stats) => err ? reject(err) : resolve(stats)))

      return stats.isDirectory()
    })

    ipcMain.handle('file_create_directory', async (event, target) => {
      if (await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(true) : resolve(false)))) {
        await new Promise((resolve, reject) => fs.mkdir(target, (err) => err ? reject(err) : resolve(true)))
      }

      return await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(false) : resolve(true)))
    })

    ipcMain.handle('file_list_directory', async (event, target) => {
      const results = await new Promise((resolve, reject) => fs.readdir(target, { withFileTypes: true }, (err, files) => err ? reject(err) : resolve(files)))

      const files = []
      for (const result of results) {
        files.push({
          name: result.name,
          directory: result.isDirectory()
        })
      }

      return files
    })

    ipcMain.handle('file_contents', async (event, target) =>
      new Promise((resolve, reject) => fs.readFile(target, 'utf8', (error, data) => error ? reject(error) : resolve(data))))

    ipcMain.handle('file_create', async (event, target, directory) => {
      if (await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(false) : resolve(true)))) {
        return false
      }

      if (directory) {
        await new Promise((resolve, reject) => fs.mkdir(target, (err) => err ? reject(err) : resolve(true)))
      } else {
        await new Promise((resolve, reject) => fs.writeFile(target, '', (err) => err ? reject(err) : resolve(true)))
      }

      return await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(false) : resolve(true)))
    })

    ipcMain.handle('file_write', async (event, target, content) => {
      await new Promise((resolve, reject) => fs.writeFile(target, content, 'utf8', (err) => err ? reject(err) : resolve()))
    })

    ipcMain.handle('file_rename', async (event, target, proposed) => {
      await new Promise((resolve, reject) => fs.rename(target, proposed, (err) => err ? reject(err) : resolve(true)))
    })

    ipcMain.handle('file_open', async (event, target, container = false) => {
      if (container) {
        shell.openPath(path.dirname(target))
      } else {
        shell.openPath(target)
      }
    })

    ipcMain.handle('file_delete', async (event, target) => {
      const unlink = async (target) => {
        const status = await new Promise((resolve, reject) => fs.lstat(target, (err, status) => err ? reject(err) : resolve(status)))
        if (status.isDirectory()) {
          const files = await new Promise((resolve, reject) => fs.readdir(target, (err, status) => err ? reject(err) : resolve(status)))

          for (const file of files) {
            await unlink(await path.join(target, file))
          }
        }

        await new Promise((resolve, reject) => fs.unlink(target, (err) => err ? reject(err) : resolve(true)))
      }

      await unlink(target)
    })

    ipcMain.handle('select_directory', (event) => {
      console.log('Select Directory')
      const window = BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Select Tome Directory',
        properties: ['openDirectory']
      }

      return dialog.showOpenDialog(window, options)
    })

    ipcMain.handle('directory_list', async (event, target) => {
      try {
        const stats = await new Promise((resolve, reject) => fs.lstat(target, (err, stats) => err ? reject(err) : resolve(stats)))

        if (!stats.isDirectory()) {
          return
        }
      } catch (error) {
        return
      }

      return new Promise((resolve, reject) => fs.readdir(target, (err, files) => err ? reject(err) : resolve(files)))
    })

    ipcMain.handle('search_path', async (event, target, criteria) => {
      search.target = target
      search.criteria = criteria
      search.length = 0
      search.targets = [target]
    })

    ipcMain.handle('search_next', async (event) => {
      if (!search.targets.length) {
        return { path: null }
      }

      const target = search.targets.shift()
      const matches = []

      const stats = await new Promise((resolve, reject) => fs.lstat(target, (err, stats) => err ? reject(err) : resolve(stats)))

      const directory = stats.isDirectory()

      const regex = search.criteria.regex_query ? new RegExp(search.criteria.query, String('g').concat(search.criteria.case_sensitive ? '' : 'i')) : null
      const query = regex || search.criteria.case_sensitive ? search.criteria.query : search.criteria.query.toLowerCase()

      const path_relative = path.relative(search.target, target)
      let path_matched = -1

      if (regex) {
        const match = regex.exec(path_relative)

        if (match !== null) {
          path_matched = match.index
        }
      } else {
        path_matched = path_relative.indexOf(query)
      }

      if (directory) {
        const results = await new Promise((resolve, reject) => fs.readdir(target, (err, files) => err ? reject(err) : resolve(files)))

        for (const result of results) {
          if (excluded_filenames.includes(result)) {
            continue
          }

          search.targets.push(path.join(target, result))
        }
      } else {
        const contents_raw = await new Promise((resolve, reject) => fs.readFile(target, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

        const contents = regex || search.criteria.case_sensitive ? contents_raw : contents_raw.toLowerCase()

        let index = -1

        let line_start = 0
        let line_end = contents.indexOf('\n', index)

        if (line_end < 0) {
          line_end = contents.length
        }

        let line = null

        while (true) {
          if (regex) {
            const match = regex.exec(contents_raw)

            if (match === null) {
              break
            } else {
              index = match.index
            }
          } else {
            index = contents.indexOf(query, index + 1)

            if (index === -1) {
              break
            }
          }

          if (index >= line_end) {
            line = null
            line_start = contents.lastIndexOf('\n', index)
            line_end = contents.indexOf('\n', index)

            if (line_end < 0) {
              line_end = contents.length
            }
          }

          if (line === null) {
            line = contents_raw.substring(line_start, line_end)
          }

          matches.push({ index, line })
        }
      }

      return {
        path: {
          absolute: target,
          relative: path_relative,
          matched: path_matched
        },
        directory,
        matches
      }
    })
  }
}
