import component from '../factory'
import { dialog, shell } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import * as os from 'os'
import { promise_with_reject, promise_access } from '../../promise'
import mime from 'mime-types'

const search:{
  target: string|null,
  targets: string[],
  length: number,
  criteria: {
    query: string,
    regex_query: boolean,
    case_sensitive: boolean,
  }|null,
  files: string[]
} = {
  target: null,
  targets: [],
  length: 0,
  criteria: null,
  files: []
}

const excluded_filenames = new Set([
  '.git',
  '.tome'
])

let watcher:chokidar.FSWatcher|null = null

export = component('file')(
  ({ handle, on }, win) => {
    on('events', (channel, target) => {
      const options = {
        cwd: target,
        ignored: ['.git'],
        ignoreInitial: true
      }

      watcher = chokidar.watch(target, options).on('all', (event, path) => {
        win.webContents.send(channel, { event, path })
      })
    })

    handle('clear-subscriptions', async () => {
      if (watcher) {
        await watcher.close()
      }
    })

    handle('exists', async (target) => promise_access(target))

    handle('is-directory', async (target) => {
      const stats = await promise_with_reject<fs.Dirent>(fs.lstat)(target)
      return stats.isDirectory()
    })

    handle('create-directory', async (target) => {
      if (!await promise_access(target)) {
        await promise_with_reject(fs.mkdir)(target)
      }

      return promise_access(target)
    })

    handle('list-directory', async (target) => {
      const results = await promise_with_reject<fs.Dirent[]>(fs.readdir)(target, { withFileTypes: true })

      const files:{ name: string, mime: string, directory: boolean }[] = []
      for (const result of results) {
        const mime_type = mime.lookup(path.join(target, result.name)) || 'text/plain'

        files.push({
          name: result.name,
          mime: mime_type,
          directory: result.isDirectory()
        })
      }

      return files
    })

    handle('contents', async (target) => promise_with_reject(fs.readFile)(target, 'utf8'))

    handle('create', async (target, directory) => {
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

    handle('write', async (target, content) => {
      await promise_with_reject(fs.writeFile)(target, content)
    })

    handle('write-library', async (target, items) => {
      let content = ''

      for (const item of items) {
        content += String(item).concat(os.EOL)
      }

      await promise_with_reject(fs.writeFile)(target, content)
    })

    handle('rename', async (target, proposed) => {
      await promise_with_reject(fs.rename)(target, proposed)
    })

    handle('open', async (target, container) => {
      if (container) {
        shell.openPath(path.dirname(target))
      } else {
        shell.openPath(target)
      }
    })

    handle('delete', async (target) => {
      const unlink = async (target) => {
        const status = await promise_with_reject<fs.Dirent>(fs.lstat)(target)
        if (status.isDirectory()) {
          const files = await promise_with_reject<string>(fs.readdir)(target)
          for (const file of files) {
            await unlink(path.join(target, file))
          }
        }

        await promise_with_reject(fs.unlink)(target)
      }

      await unlink(target)
    })

    handle('select-directory', () => {
      const options:Electron.OpenDialogOptions = {
        title: 'Select Tome Directory',
        properties: ['openDirectory']
      }

      return dialog.showOpenDialog(win, options)
    })

    handle('directory-list', async (target) => {
      try {
        const stats = await promise_with_reject<fs.Dirent>(fs.lstat)(target)

        if (!stats.isDirectory()) {
          return
        }
      } catch {
        return
      }

      return promise_with_reject(fs.readdir)(target)
    })

    handle('search-path', async (target, criteria) => {
      search.target = target
      search.criteria = criteria
      search.length = 0
      search.targets = [target]
    })

    handle('search-next', async () => {
      if (search.targets.length === 0) {
        return { path: null }
      }

      const target = search.targets.shift()
      const matches:{ index: number, line: string|null }[] = []

      const stats = await promise_with_reject<fs.Dirent>(fs.lstat)(target)

      const directory = stats.isDirectory()

      if (search.criteria === null) {
        return
      }

      const regex = search.criteria.regex_query ? new RegExp(search.criteria.query, String('g').concat(search.criteria.case_sensitive ? '' : 'i')) : null
      const query = regex || search.criteria.case_sensitive ? search.criteria.query : search.criteria.query.toLowerCase()

      const path_relative = path.relative(search.target || '', target || '')
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
        const results = await promise_with_reject<string[]>(fs.readdir)(target)

        for (const result of results) {
          if (excluded_filenames.has(result)) {
            continue
          }

          search.targets.push(path.join(target || '', result))
        }
      } else {
        const contents_raw = await promise_with_reject<string>(fs.readFile)(target, 'utf8')

        const contents = regex || search.criteria.case_sensitive ? contents_raw : contents_raw.toLowerCase()

        let index = -1

        let line_start = 0
        let line_end = contents.indexOf('\n', index)

        if (line_end < 0) {
          line_end = contents.length
        }

        let line = null
        const loop = true

        while (loop) {
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
)
