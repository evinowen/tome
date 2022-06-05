const { ipcMain } = require('electron')
const Repository = require('./Repository')

let repository

module.exports = {
  register: () => {
    ipcMain.handle('load_repository', async (event, path) => {
      console.log('New Repository', path)
      repository = new Repository(path)

      console.log('Load Repository', path)
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

    ipcMain.handle('inspect_repository', async (event) => {
      console.log('Inspect Repository')
      await repository.inspect()
    })

    ipcMain.handle('refresh_repository', async (event) => {
      console.log('Refresh Repository')
      return {
        available: repository.available,
        staged: repository.staged
      }
    })

    ipcMain.handle('refresh_patches_repository', async (event) => {
      console.log('Refresh Repository Patches')
      return { patches: repository.patches }

    })

    ipcMain.handle('diff_path_repository', async (event, path) => {
      console.log('Diff Repository Path', path)
      await repository.diffPath(path)
    })

    ipcMain.handle('diff_commit_repository', async (event, commit) => {
      console.log('Diff Repository Commit', commit)
      return repository.diffCommit(commit)
    })

    ipcMain.handle('credential_repository', async (event, private_key, public_key, passphrase) => {
      console.log('Add Repository Credentials', private_key, public_key, '*'.repeat(passphrase.length))
      repository.storeCredentials(private_key, public_key, passphrase)
    })

    ipcMain.handle('stage_repository', async (event, query) => {
      await repository.stage(query, async (type, path) => {
        let wording
        if (type === 'add') {
          wording = 'as addition'
        } else if (type === 'remove') {
          wording = 'as removal'
        }

        console.log(`Staging path ${path} ${wording}`)
      })
    })

    ipcMain.handle('reset_repository', async (event, query) => {
      await repository.reset(query, async (type, path) => {
        console.log(`Reseting path ${path}`)
      })
    })

    ipcMain.handle('push_repository', async (event) => {
      await repository.push()
    })

    ipcMain.handle('load_remote_url_repository', async (event, url) => {
      await repository.loadRemoteBranch(url)
    })

    ipcMain.handle('remote_repository', async (event, url) => {
      const result = {
        remote: repository.remote,
        pending: repository.pending
      }

      return result
    })

    ipcMain.handle('commit_repository', async (event, name, email, message) => {
      const oid = await repository.commit(name, email, message)

      return oid.tostrS()
    })
  }
}
