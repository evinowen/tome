const component = require('../factory')
const Repository = require('./Repository')
const log = require('electron-log')

let repository

module.exports = component('repository')(
  ({ handle }) => {
    handle('load', async (path) => {
      repository = new Repository(path)

      log.info('Load Repository', path)
      await repository.load()

      return {
        name: repository.name,
        path: repository.path,
        history: repository.history,
        branch: repository.branch,
        remotes: repository.remotes,
        available: repository.available,
        staged: repository.staged
      }
    })

    handle('inspect', async () => await repository.inspect())

    handle('refresh', async () => ({ available: repository.available, staged: repository.staged }))

    handle('refresh-patches', async () => ({ patches: repository.patches }))

    handle('diff-path', async (path) => await repository.diffPath(path))

    handle('diff-commit', async (commit) => repository.diffCommit(commit))

    handle('credential', async (private_key, public_key, passphrase) => repository.storeCredentials(private_key, public_key, passphrase))

    handle('stage', async (query) => {
      await repository.stage(query, async (type, path) => {
        let wording
        if (type === 'add') {
          wording = 'as addition'
        } else if (type === 'remove') {
          wording = 'as removal'
        }

        log.info(`Staging path ${path} ${wording}`)
      })
    })

    handle('reset', async (query) => {
      await repository.reset(query, async (type, path) => {
        log.info(`Reseting path ${path}`)
      })
    })

    handle('push', async () => await repository.push())

    handle('clear-remote', async () => repository.clearRemoteBranch())

    handle('load-remote-url', async (url) => await repository.loadRemoteBranch(url))

    handle('remote', async () => {
      const result = {
        remote: repository.remote,
        pending: repository.pending
      }

      return result
    })

    handle('commit', async (name, email, message) => {
      const oid = await repository.commit(name, email, message)

      return oid.tostrS()
    })
  },
  () => ({ repository })
)
