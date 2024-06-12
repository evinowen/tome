import * as NodeGit from 'nodegit'
import RepositoryFile from '@/objects/repository/RepositoryFile'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export default class RepositoryInspectorDelegate extends RepositoryDelegate {
  async inspect_all () {
    const result = {
      available: await this.inspect_available(),
      staged: await this.inspect_staged(),
    }

    return result
  }

  async inspect_available () {
    return await this.inspect({
      show: NodeGit.Status.SHOW.WORKDIR_ONLY,
      flags: NodeGit.Status.OPT.INCLUDE_UNTRACKED + NodeGit.Status.OPT.RECURSE_UNTRACKED_DIRS,
    })
  }

  async inspect_staged () {
    return await this.inspect({
      show: NodeGit.Status.SHOW.INDEX_ONLY,
    })
  }

  async inspect (options) {
    const files = await this.repository.getStatus(options)
    return files.map((status) => new RepositoryFile(status))
  }
}
