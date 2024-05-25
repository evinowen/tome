import * as NodeGit from 'nodegit'
import * as _path from 'node:path'

export default class RepositoryPatch {
  name = ''
  path = ''
  lines: { type: NodeGit.Diff.LINE, line: string }[] = []

  static async *compile (diff: NodeGit.Diff) {
    const patches = await diff.patches()

    for (const patch of patches) {
      yield await RepositoryPatch.build(patch)
    }
  }

  static async build (patch: NodeGit.ConvenientPatch) {
    const instance = new RepositoryPatch()

    const old_file = patch.oldFile()
    const new_file = patch.newFile()

    const old_file_path = old_file.path()
    const new_file_path = new_file.path()

    old_file_path === new_file_path
      ? instance.path = new_file_path
      : instance.path = `${old_file_path} => ${new_file_path}`

    instance.name = _path.basename(new_file_path)

    const hunks = await patch.hunks()
    for (const hunk of hunks) {
      instance.lines.push({
        type: NodeGit.Diff.LINE.HUNK_HDR,
        line: hunk.header(),
      })

      const lines = await hunk.lines()
      for (const line of lines) {
        instance.lines.push({
          type: line.origin(),
          line: line.content(),
        })
      }
    }

    return instance
  }
}
