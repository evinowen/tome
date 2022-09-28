const component = require('../factory')
const Repository = require('./Repository')
const log = require('electron-log')

let repository

module.exports = component('repository')(
  ({ handle }) => {
    handle('load', async (event, path) => {
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

    handle('inspect', async (event) => await repository.inspect())

    handle('refresh', async (event) => ({ available: repository.available, staged: repository.staged }))

    handle('refresh-patches', async (event) => ({ patches: repository.patches }))

    handle('diff-path', async (event, path) => await repository.diffPath(path))

    handle('diff-commit', async (event, commit) => repository.diffCommit(commit))

    handle('credential', async (event, private_key, public_key, passphrase) => repository.storeCredentials(private_key, public_key, passphrase))

    handle('stage', async (event, query) => {
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

    handle('reset', async (event, query) => {
      await repository.reset(query, async (type, path) => {
        log.info(`Reseting path ${path}`)
      })
    })

    handle('push', async (event) => await repository.push())

    handle('clear-remote', async (event) => repository.clearRemoteBranch())

    handle('load-remote-url', async (event, url) => await repository.loadRemoteBranch(url))

    handle('remote', async (event) => {
      const result = {
        remote: repository.remote,
        pending: repository.pending
      }

      return result
    })

    handle('commit', async (event, name, email, message) => {
      const oid = await repository.commit(name, email, message)

      return oid.tostrS()
    })
  },
  () => ({ repository })
)
