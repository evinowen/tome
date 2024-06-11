import * as NodeGit from 'nodegit'
import RepositoryCredentials from '@/objects/repository/RepositoryCredentials'
import RepositoryRemote, { RepositoryRemoteSimple } from '@/objects/repository/RepositoryRemote'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export class ErrorFactory {
  static RemoteNotConfiguredError = (name) => `Remote name "${name}" not found in configuraiton.`
  static RemoteUnableToLoadError = (name) => `Remote object "${name}" could not be loaded.`
  static RemoteUnableToConnectError = (name) => `Connection to Remote "${name}" could not be established.`
}

export default class RepositoryRemoteDelegate extends RepositoryDelegate {
  credential: () => RepositoryCredentials

  list: RepositoryRemoteSimple[] = []
  map = new Map<string, NodeGit.Remote>()

  active: RepositoryRemote

  async load () {
    this.list.length = 0
    this.map.clear()

    const list = await this.repository.getRemotes()

    this.list = list.map((remote) => ({
      name: remote.name(),
      url: remote.url(),
    }))

    for (const remote of list) {
      this.map.set(remote.name(), remote)
    }
  }

  async add (name, url) {
    await NodeGit.Remote.create(this.repository, name, url)
    await this.load()
  }

  async remove (name) {
    await NodeGit.Remote.delete(this.repository, name)
    await this.load()
  }

  async select (name: string, branch: string) {
    const remote = new RepositoryRemote(this.credential)

    remote.simple = this.list.find((remote) => remote.name === name)
    if (remote.simple === undefined) {
      return { error: ErrorFactory.RemoteNotConfiguredError(name) }
    }

    remote.object = this.map.get(remote.simple.name)
    if (remote.object === undefined) {
      return { error: ErrorFactory.RemoteUnableToLoadError(name) }
    }

    try {
      await remote.select_branch(branch)
    } catch {
      return { error: ErrorFactory.RemoteUnableToConnectError(name) }
    }

    this.active = remote
    return { success: true }
  }

  close () {
    delete this.active
  }
}
