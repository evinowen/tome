import * as NodeGit from 'nodegit'
import * as _path from 'node:path'

export default class RepositoryPatch {
  name = ''
  path = ''
  lines: { type: NodeGit.Diff.LINE, line: string }[] = []

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

    old_file_path === new_file_path
      ? this.path = new_file_path
      : this.path = `${old_file_path} => ${new_file_path}`

    this.name = _path.basename(new_file_path)

    const hunks = await patch.hunks()
    for (const hunk of hunks) {
      this.lines.push({
        type: NodeGit.Diff.LINE.HUNK_HDR,
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
