const factory = require('../factory')
const Repository = require('./Repository')
const log = require('electron-log')

let repository

module.exports = factory(
  ({ handle }, win) => {
    handle('load-repository', async (event, path) => {
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

    handle('inspect-repository', async (event) => {
      await repository.inspect()
    })

    handle('refresh-repository', async (event) => {
      return {
        available: repository.available,
        staged: repository.staged
      }
    })

    handle('refresh-patches-repository', async (event) => {
      return { patches: repository.patches }
    })

    handle('diff-path-repository', async (event, path) => {
      await repository.diffPath(path)
    })

    handle('diff-commit-repository', async (event, commit) => {
      return repository.diffCommit(commit)
    })

    handle('credential-repository', async (event, private_key, public_key, passphrase) => {
      repository.storeCredentials(private_key, public_key, passphrase)
    })

    handle('stage-repository', async (event, query) => {
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

    handle('reset-repository', async (event, query) => {
      await repository.reset(query, async (type, path) => {
        log.info(`Reseting path ${path}`)
      })
    })

    handle('push-repository', async (event) => {
      await repository.push()
    })

    handle('clear-remote-repository', async (event) => {
      repository.clearRemoteBranch()
    })

    handle('load-remote-url-repository', async (event, url) => {
      await repository.loadRemoteBranch(url)
    })

    handle('remote-repository', async (event) => {
      const result = {
        remote: repository.remote,
        pending: repository.pending
      }

      return result
    })

    handle('commit-repository', async (event, name, email, message) => {
      const oid = await repository.commit(name, email, message)

      return oid.tostrS()
    })
  },
  () => ({ repository })
)
