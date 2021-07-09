import { remote } from 'electron'
import NodeGit from 'nodegit'

const remote_path = remote.require('path')

export default class RepositoryPatch {
  static LineType = NodeGit.Diff.LINE

  constructor () {
    this.name = ''
    this.path = ''
    this.lines = []
  }

  async build (patch) {
    const old_file = patch.oldFile()
    const new_file = patch.newFile()

    const old_file_path = old_file.path()
    const new_file_path = new_file.path()

    if (old_file_path === new_file_path) {
      this.path = new_file_path
    } else {
      this.path = `${old_file_path} => ${new_file_path}`
    }

    this.name = remote_path.basename(new_file_path)

    const hunks = await patch.hunks()
    for (const hunk of hunks) {
      this.lines.push({
        type: RepositoryPatch.LineType.HUNK_HDR,
        line: hunk.header()
      })

      const lines = await hunk.lines()
      for (const line of lines) {
        this.lines.push({
          type: line.origin(),
          line: line.content()
        })
      }
    }
  }
}
