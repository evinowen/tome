import * as node_path from 'node:path'
import * as node_fs from 'node:fs'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export default class RepositoryBranchDelegate extends RepositoryDelegate {
  name: string

  async load () {
    this.name = this.repository.headUnborn()
      ? this.load_unborn_branch()
      : (await this.load_born_branch())
  }

  load_unborn_branch () {
    const path = this.repository.path()

    const headnode_path = node_path.join(path, '.git', 'HEAD')
    const head_raw = node_fs.readFileSync(headnode_path, 'utf8')

    let head_line_index = head_raw.length

    const head_line_index_n = head_raw.indexOf('\n')
    const head_line_index_r = head_raw.indexOf('\r')

    if (head_line_index_n >= 0) {
      head_line_index = Math.min(head_line_index_n, head_line_index)
    }

    if (head_line_index_r >= 0) {
      head_line_index = Math.min(head_line_index_r, head_line_index)
    }

    const head_trimmed = head_raw.slice(0, head_line_index)

    const head_parsed = head_trimmed.match(/^ref: refs\/heads\/(.*)$/m)

    if (head_parsed) {
      return head_parsed[1]
    }
  }

  async load_born_branch () {
    const branch = await this.repository.head()
    return branch.shorthand()
  }
}
