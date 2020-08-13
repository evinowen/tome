import { remote } from 'electron'
import NodeGit from 'nodegit'

export default {
  namespaced: true,
  state: {
    name: '',
    path: '',
    repository: null,
    ready: false,
    branch: {
      name: '',
      error: ''
    },
    status: {
      staged: {
        new: 0,
        renamed: 0,
        modified: 0,
        deleted: 0,
        items: []
      },
      available: {
        new: 0,
        renamed: 0,
        modified: 0,
        deleted: 0,
        items: []
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
    },
    stale: function (state) {
      state.ready = false
    },
    ready: function (state, data) {
      const { status } = data

      Object.keys(status).forEach(function (type) {
        const source = status[type]
        const target = state.status[type]

        target.new = source.new || 0
        target.renamed = source.renamed || 0
        target.modified = source.modified || 0
        target.deleted = source.deleted || 0

        target.items.length = 0
        source.items.forEach(item => target.items.push(item))
      })

      state.ready = true
    }
  },
  actions: {
    load: async function (context, target) {
      const fs = remote.require('fs')
      const path = remote.require('path')

      context.commit('stale')

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
        const fs = remote.require('fs')
        const path = remote.require('path')

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
    },
    inspect: async function (context) {
      context.commit('stale')

      const status = {
        staged: {
          new: 0,
          renamed: 0,
          modified: 0,
          deleted: 0,
          items: []
        },
        available: {
          new: 0,
          renamed: 0,
          modified: 0,
          deleted: 0,
          items: []
        }
      }

      const load_index = context.state.repository.getStatus((() => {
        const ops = new NodeGit.StatusOptions()

        ops.show = NodeGit.Status.SHOW.INDEX_ONLY

        return ops
      })())
        .then(res => res.forEach(repo_status => {
          const item = {
            path: repo_status.path()

          }

          if (repo_status.isNew()) {
            item.type = 'New'
            item.color = 'green'
            item.icon = 'mdi-file-star'
            status.staged.new += 1
          } else if (repo_status.isModified()) {
            item.type = 'Modified'
            item.color = 'green'
            item.icon = 'mdi-file-edit'
            status.staged.modified += 1
          } else if (repo_status.isRenamed()) {
            item.type = 'Renamed'
            item.color = 'green'
            item.icon = 'mdi-file-swap'
            status.staged.renamed += 1
          } else if (repo_status.isDeleted()) {
            item.type = 'Deleted'
            item.color = 'red'
            item.icon = 'mdi-file-remove'
            status.staged.deleted += 1
          }

          status.staged.items.push(item)
        }))

      const load_working_tree = context.state.repository.getStatus((() => {
        const ops = new NodeGit.StatusOptions()

        ops.show = NodeGit.Status.SHOW.WORKDIR_ONLY
        ops.flags = NodeGit.Status.OPT.INCLUDE_UNTRACKED + NodeGit.Status.OPT.RECURSE_UNTRACKED_DIRS

        return ops
      })())
        .then(res => res.forEach(repo_status => {
          const item = {
            path: repo_status.path()

          }

          if (repo_status.isNew()) {
            item.type = 'New'
            item.color = 'green'
            item.icon = 'mdi-file-star'
            status.available.new += 1
          } else if (repo_status.isModified()) {
            item.type = 'Modified'
            item.color = 'green'
            item.icon = 'mdi-file-edit'
            status.available.modified += 1
          } else if (repo_status.isRenamed()) {
            item.type = 'Renamed'
            item.color = 'green'
            item.icon = 'mdi-file-swap'
            status.available.renamed += 1
          } else if (repo_status.isDeleted()) {
            item.type = 'Deleted'
            item.color = 'red'
            item.icon = 'mdi-file-remove'
            status.available.deleted += 1
          }

          status.available.items.push(item)
        }))

      await Promise.all([load_index, load_working_tree])

      context.commit('ready', { status })
    }
  }
}
