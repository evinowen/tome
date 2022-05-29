const { ipcMain } = require('electron')
const Repository = require('./Repository')

let repository

module.exports = {
  register: () => {
    ipcMain.handle('load_repository', async (event, path) => {
      console.log('New Repository')
      repository = new Repository(path)

      console.log('Load Repository')
      await repository.load()

      const result = {
        name: repository.name,
        path: repository.path,
        history: repository.history,
        branch: repository.branch,
        remotes: repository.remotes,
        available: repository.available,
        staged: repository.staged
      }

      console.log(result)

      return result
    })

    ipcMain.handle('inspect_repository', async (event, path) => {
      console.log('Inspect Repository')
      await repository.inspect()
    })

    ipcMain.handle('refresh_repository', async (event, path) => {
      console.log('Refresh Repository')
      const result = {
        available: repository.available,
        staged: repository.staged
      }

      console.log(result)

      return result
    })

    ipcMain.handle('diff_path_repository', async (event, path) => {
      console.log('diff_path_repository')
      const result = await repository.diffPath(path)

      console.log(result)

      return result
    })

    ipcMain.handle('diff_commit_repository', async (event, commit) => {
      console.log('diff_commit_repository')
      const result = await repository.diffCommit(commit)

      console.log(result)

      return result
    })

    ipcMain.handle('credential_repository', async (event, private_key, public_key, passphrase) => {
      console.log('credential_repository')
      repository.storeCredentials(private_key, public_key, passphrase)
    })

    ipcMain.handle('push_repository', async (event) => {
      console.log('push_repository')
      await repository.push_repository()
    })

    ipcMain.handle('load_remote_url_repository', async (event, url) => {
      console.log('load_remote_url_repository')
      await repository.loadRemoteBranch(url)
    })

    ipcMain.handle('remote_repository', async (event, url) => {
      console.log('remote_repository')
      const result = {
        remote: repository.remote,
        pending: repository.pending
      }

      console.log(result)

      return result
    })
  }
}
