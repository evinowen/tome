const { ipcMain, dialog, shell } = require('electron')

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const { promise_with_reject, promise_access } = require('../../promise')

const search = {
  target: null,
  criteria: null,
  files: []
}

const excluded_filenames = new Set([
  '.git',
  '.tome'
])

let watcher = null

module.exports = {
  register: (win) => {
    ipcMain.on('file_subscribe', (event, target) => {
      const options = {
        cwd: target,
        ignored: ['.git'],
        ignoreInitial: true
      }

      watcher = chokidar.watch(target, options).on('all', (event, path) => {
        win.webContents.send('file_subscription_update', { event, path })
      })
    })

    ipcMain.handle('file_clear_subscriptions', async (event) => {
      if (watcher) {
        await watcher.close()
      }
    })

    ipcMain.handle('file_exists', async (event, target) => promise_access(target))

    ipcMain.handle('file_is_directory', async (event, target) => {
      const stats = await promise_with_reject(fs.lstat)(target)
      return stats.isDirectory()
    })

    ipcMain.handle('file_create_directory', async (event, target) => {
      if (!await promise_access(target)) {
        await promise_with_reject(fs.mkdir)(target)
      }

      return promise_access(target)
    })

    ipcMain.handle('file_list_directory', async (event, target) => {
      const results = await promise_with_reject(fs.readdir)(target, { withFileTypes: true })

      const files = []
      for (const result of results) {
        files.push({
          name: result.name,
          directory: result.isDirectory()
        })
      }

      return files
    })

    ipcMain.handle('file_contents', async (event, target) => promise_with_reject(fs.readFile)(target, 'utf8'))

    ipcMain.handle('file_create', async (event, target, directory) => {
      if (await promise_access(target)) {
        return false
      }

      if (directory) {
        await promise_with_reject(fs.mkdir)(target)
      } else {
        await promise_with_reject(fs.writeFile)(target, '')
      }

      return promise_access(target)
    })

    ipcMain.handle('file_write', async (event, target, content) => {
      await promise_with_reject(fs.writeFile)(target, content)
    })

    ipcMain.handle('file_rename', async (event, target, proposed) => {
      await promise_with_reject(fs.rename)(target, proposed)
    })

    ipcMain.handle('file_open', async (event, target, container) => {
      if (container) {
        shell.openPath(path.dirname(target))
      } else {
        shell.openPath(target)
      }
    })

    ipcMain.handle('file_delete', async (event, target) => {
      const unlink = async (target) => {
        const status = await promise_with_reject(fs.lstat)(target)
        if (status.isDirectory()) {
          const files = await promise_with_reject(fs.readdir)(target)
          for (const file of files) {
            await unlink(path.join(target, file))
          }
        }

        await promise_with_reject(fs.unlink)(target)
      }

      await unlink(target)
    })

    ipcMain.handle('select_directory', (event) => {
      console.log('Select Directory')
      const options = {
        title: 'Select Tome Directory',
        properties: ['openDirectory']
      }

      return dialog.showOpenDialog(win, options)
    })

    ipcMain.handle('directory_list', async (event, target) => {
      try {
        const stats = await promise_with_reject(fs.lstat)(target)

        if (!stats.isDirectory()) {
          return
        }
      } catch {
        return
      }

      return promise_with_reject(fs.readdir)(target)
    })

    ipcMain.handle('search_path', async (event, target, criteria) => {
      search.target = target
      search.criteria = criteria
      search.length = 0
      search.targets = [target]
    })

    ipcMain.handle('search_next', async (event) => {
      if (search.targets.length === 0) {
        return { path: null }
      }

      const target = search.targets.shift()
      const matches = []

      const stats = await promise_with_reject(fs.lstat)(target)

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
        const results = await promise_with_reject(fs.readdir)(target)

        for (const result of results) {
          if (excluded_filenames.has(result)) {
            continue
          }

          search.targets.push(path.join(target, result))
        }
      } else {
        const contents_raw = await promise_with_reject(fs.readFile)(target, 'utf8')

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
            line = contents_raw.slice(line_start, line_end)
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
