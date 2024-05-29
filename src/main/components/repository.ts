import component from '@/objects/ComponentFactory'
import RepositoryManager from '@/objects/repository/RepositoryManager'

let repository: RepositoryManager

export default component('repository')(
  ({ handle, log }) => {
    handle('load', async (path) => {
      repository = await RepositoryManager.create(path)

      return {
        name: repository.name,
        path: repository.path,
      }
    })

    handle('inspect', async () => await repository.inspector.inspect_all())

    handle('diff-path', async (path) => await repository.comparator.diff_path(path))

    handle('diff-commit', async (commit) => await repository.comparator.diff_commit(commit))

    handle(
      'credential-password',
      async (username, password) => repository.credentials.configure_password(username, password),
    )

    handle(
      'credential-key',
      async (private_key, public_key, passphrase) => repository.credentials.configure_key(private_key, public_key, passphrase),
    )

    handle('stage', async (query) => {
      await repository.committer.stage(query, async (type, path) => {
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
      await repository.committer.reset(query, async (type, path) => {
        log.info(`Reseting path ${path}`)
      })
    })

    handle('commit', async (name, email, message) => {
      const oid = await repository.committer.commit(name, email, message)

      return oid.tostrS()
    })

    handle('push', async () => await repository.remotes.active.push())

    handle('remote-status', async () => {
      const result = {
        remote: repository.remotes.active?.simple,
        pending: repository.remotes.active?.pending,
        branch: undefined,
      }

      if (repository.remotes.active?.branch) {
        result.branch = {
          name: repository.remotes.active.branch.name,
          short: repository.remotes.active.branch.short,
        }
      }

      return result
    })

    handle('branch-status', async () => await repository.branch.status())
    handle('branch-create', async (name) => await repository.branch.create(name))
    handle('branch-select', async (name) => await repository.branch.select(name))
    handle('branch-rename', async (name, value) => await repository.branch.rename(name, value))
    handle('branch-remove', async (name) => await repository.branch.remove(name))

    handle('remote-list', async () => {
      await repository.remotes.load()
      return repository.remotes.list
    })

    handle('remote-add', async (name, url) => {
      await repository.remotes.add(name, url)
      return repository.remotes.list
    })

    handle('remote-remove', async (name) => {
      await repository.remotes.remove(name)
      return repository.remotes.list
    })

    handle('remote-load', async (name) => await repository.remotes.select(name, repository.branch.active))

    handle('remote-clear', async () => repository.remotes.close())

    handle('history-list', async (page: number) => {
      await repository.history.load(page)
      return repository.history.items
    })

    handle('tag-list', async () => await repository.tags.fetch())
    handle('tag-remove', async (name) => await repository.tags.remove(name))
  },
  () => ({ repository }),
)
