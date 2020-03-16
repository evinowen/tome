import { remote } from 'electron'
import NodeGit from 'nodegit'

const fs = remote.require('fs')
const path = remote.require('path')

export default {
  state: {
    name: '',
    path: '',
    repository: null,
    branch: {
      name: '',
      error: ''
    },
    status: {
      staged: {
        new: 0,
        renamed: 0,
        modified: 0,
        deleted: 0
      },
      available: {
        new: 0,
        renamed: 0,
        modified: 0,
        deleted: 0
      }
    }
  },
  mutations: {
    set: function (state, data) {
      const { repository, branch } = data

      state.repository = repository
      state.branch.name = branch
    },
    error: function (state, message) {
      state.branch.error = message
    }
  },
  actions: {
    load: async function (context, target) {
      let repository = null
      let branch = null

      context.state.path = target
      context.state.name = path.basename(context.state.path)

      if (fs.existsSync(path.join(context.state.path, '.git'))) {
        repository = await NodeGit.Repository.open(context.state.path)
      } else {
        repository = await NodeGit.Repository.init(context.state.path, 0)
      }

      if (!repository) {
        context.commit('error', 'No Repository!')
        return
      }

      if (repository.headDetached()) {
        context.commit('error', 'Head Detached')
        return
      }

      if (repository.isMerging()) {
        context.commit('error', 'Merging')
        return
      }

      if (repository.isRebasing()) {
        context.commit('error', 'Rebasing')
        return
      }

      if (repository.headUnborn()) {
        const head_raw = fs.readFileSync(path.join(context.state.path, '.git', 'HEAD'), 'utf8')

        let head_line_index = head_raw.length

        const head_line_index_n = head_raw.indexOf('\n')
        const head_line_index_r = head_raw.indexOf('\r')

        if (head_line_index_n >= 0) {
          head_line_index = Math.min(head_line_index_n, head_line_index)
        }

        if (head_line_index_r >= 0) {
          head_line_index = Math.min(head_line_index_r, head_line_index)
        }

        const head_trimmed = head_raw.substring(0, head_line_index)

        const head_parsed = head_trimmed.match(/^ref: refs\/heads\/(.*)$/m)

        if (head_parsed) {
          branch = head_parsed[1]
        }
      } else {
        const branch_full = await repository.head()
        branch = branch_full.shorthand()
      }

      context.commit('set', { repository, branch })
    }
  }
}
