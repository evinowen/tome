<template>
  <v-app id="inspire">
    <system-bar title="tome" @settings="settings = true" />
    <v-navigation-drawer v-model="settings" fixed temporary/>

    <editor-interface
      :edit=edit
      :commit=commit
      :push=push
      @commit:close="commit = false"
      @push:close="push = false"
      @context=open_context
    />

    <new-file-service
      :active="add.active"
      @close="add.active = false"
      @create="reload_selected_explorer"
      :base="tome.path" :target="add_target"
      :extension="add.as_directory ? null : 'md'"
      :folder="add.as_directory"
    />

    <context-menu-service
      v-model=context.visible
      :title=context.title
      :target=context.target
      :items=context.items
      :position_x=context.position.x
      :position_y=context.position.y
    />

    <action-bar
      :waiting=reload_counter
      :commit=commit
      :push=push
      @open=set_tome
      @edit="edit = $event"
      @commit="commit = true"
      @push="push = true"
    />
  </v-app>
</template>

<style>
html, body {
  font-size: 12px !important;
  overflow: hidden !important;

}

.v-icon.v-icon {
  font-size: 18px;

}

</style>

<script>
import store from './store'
import { remote, shell } from 'electron'

import NewFileService from './components/NewFileService.vue'
import ContextMenuService from './components/ContextMenuService.vue'

import SystemBar from './components/SystemBar.vue'
import EditorInterface from './components/EditorInterface.vue'
import ActionBar from './components/ActionBar.vue'

import git from 'nodegit'

const fs = remote.require('fs')
const path = remote.require('path')

export default {
  props: {
    source: String
  },
  data: () => ({
    settings: false,

    reload_triggered: false,
    reload_counter: 0,
    reload_max: 3,

    edit: false,
    commit: false,
    push: false,

    add: {
      active: false,
      value: '',
      relative_path: '',
      as_directory: false
    },

    context: {
      visible: false,
      title: null,
      target: null,
      items: [],
      position: { x: 0, y: 0 }
    }

  }),
  mounted: async function () {
    store.state.tome_file_actions_root = [
      {
        name: 'New File',
        icon: 'mdi-file-star',
        action: (event) => {
          console.log('new file', event)
          this.add.value = ''
          this.add.relative_path = ''
          this.add.as_directory = false
          this.add.active = true
        }
      },
      {
        name: 'New Folder',
        icon: 'mdi-folder-star',
        action: (event) => {
          console.log('new folder', event)
          this.add.value = ''
          this.add.relative_path = ''
          this.add.as_directory = true
          this.add.active = true
        }
      },
      {
        name: 'Open Folder',
        icon: 'mdi-folder-move',
        action: (event) => {
          console.log('open folder', event)
          shell.openItem(store.state.tome.path)
        }
      }
    ]

    store.state.tome_file_actions = store.state.tome_file_actions_root

    store.state.tome_app_config_path_dir = path.join(remote.app.getPath('appData'), 'tome')

    let create_directory = false

    try {
      await new Promise((resolve, reject) => fs.lstat(store.state.tome_app_config_path_dir, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_directory = true
    }

    if (create_directory) {
      const err = await new Promise((resolve, reject) => fs.mkdir(store.state.tome_app_config_path_dir, { recursive: true }, (err) => err ? reject(err) : resolve(true)))

      if (err) {
        console.error(`Failure to create Tome configuration folder at ${store.state.tome_app_config_path_dir}`)
      }
    }

    store.state.tome_app_config_path = path.join(store.state.tome_app_config_path_dir, 'config.json')

    let create_file = false

    try {
      await new Promise((resolve, reject) => fs.lstat(store.state.tome_app_config_path, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_file = true
    }

    if (create_file) {
      const fd = await new Promise((resolve, reject) => fs.open(store.state.tome_app_config_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
      await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)))
    }

    await this.configure()
  },
  methods: {
    configure: async function (input) {
      const data = await new Promise((resolve, reject) => fs.readFile(store.state.tome_app_config_path, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

      let parsed = {}

      try {
        parsed = JSON.parse(data)
        console.log('configuration loaded', parsed)
      } catch (err) {
        console.log('configuration load failed', err)
      }

      if (!parsed || typeof parsed !== 'object') {
        console.log('configuration parsed format error', parsed)
        parsed = {}
      }

      store.state.tome_config = {
        name: '',
        email: '',
        private_key: '',
        public_key: '',
        passphrase: '',

        ...parsed

      }

      console.log('configuration complete', store.state.tome_config)
      return true
    },
    choose_tome: function (event) {
      this.$refs.tome.click()
    },
    open_commit: async function (event, test) {
      console.log('test!', event, test)
      // await this.reload_run()
      this.commit = true
    },
    set_tome: async function (file_path) {
      store.state.tome.path = file_path
      store.state.tome.name = path.basename(store.state.tome.path)
      console.log(`Set Tome path to ${store.state.tome.path}`)

      if (fs.existsSync(path.join(store.state.tome.path, '.git'))) {
        store.state.tome.repository = await git.Repository.open(store.state.tome.path).catch(err => console.error(err))
      } else {
        store.state.tome.repository = await git.Repository.init(store.state.tome.path, 0)
      }

      if (!store.state.tome.repository) {
        store.state.tome.branch.error = 'No Repository!'
        return
      }

      if (store.state.tome.repository.headDetached()) {
        store.state.tome.branch.error = 'Head Detached'
        return
      }

      if (store.state.tome.repository.isMerging()) {
        store.state.tome.branch.error = 'Merging'
        return
      }

      if (store.state.tome.repository.isRebasing()) {
        store.state.tome.branch.error = 'Rebasing'
        return
      }

      console.log('Pass checks for repo.')

      if (store.state.tome.repository.headUnborn()) {
        console.log('Unborn repo.')
        const head_raw = fs.readFileSync(path.join(store.state.tome.path, '.git', 'HEAD'), 'utf8')
        console.log(head_raw)

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
        console.log(head_parsed)

        if (head_parsed) {
          store.state.tome.branch.name = head_parsed[1]
        }
      } else {
        console.log('Existing repo.')
        const branch = await store.state.tome.repository.head()

        console.log(branch)
        store.state.tome.branch.name = branch.shorthand()
        console.log(store.state.tome.branch.name)
      }
    },
    action_new_file: async function (target_path) {
      console.log('new file', target_path)
      this.add.value = ''
      this.add.relative_path = target_path
      this.add.as_directory = false
      this.add.active = true
    },
    action_new_folder: async function (target_path) {
      console.log('new folder', target_path)
      this.add.value = ''
      this.add.relative_path = target_path
      this.add.as_directory = true
      this.add.active = true
    },
    action_open_folder: async function (path) {
      console.log('action_open_folder', path)
      shell.openItem(path)
    },

    reload_start: function () {
      clearTimeout(this.reload_timeout)

      this.reload_triggered = true
      this.reload_counter = this.reload_max

      this.reload_timeout = setTimeout(this.reload_update, 500)
    },
    reload_update: async function () {
      if (!this.reload_counter) {
        return this.reload_run()
      }

      this.reload_counter = this.reload_counter - 1

      if (this.reload_counter >= 0) {
        this.reload_timeout = setTimeout(this.reload_update, 1000)
      }
    },
    reload_run: async function () {
      console.debug('[Git Repository Status Reload] Begin')

      clearTimeout(this.reload_timeout)
      this.reload_triggered = false

      const tome_status = {
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

      var ops = new git.StatusOptions()

      store.state.tome_ready = false

      console.debug('[Git Repository Status Reload] Load Index')
      ops.show = git.Status.SHOW.INDEX_ONLY
      const load_index = store.state.tome.repository.getStatus(ops)
        .then(res => res.forEach(repo_status => {
          console.debug('[Git Repository Status Reload] Index File', repo_status)

          const item = {
            path: repo_status.path()

          }

          if (repo_status.isNew()) {
            item.type = 'New'
            item.color = 'green'
            item.icon = 'mdi-file-star'
            tome_status.staged.new += 1
          } else if (repo_status.isModified()) {
            item.type = 'Modified'
            item.color = 'green'
            item.icon = 'mdi-file-edit'
            tome_status.staged.modified += 1
          } else if (repo_status.isRenamed()) {
            item.type = 'Renamed'
            item.color = 'green'
            item.icon = 'mdi-file-swap'
            tome_status.staged.renamed += 1
          } else if (repo_status.isDeleted()) {
            item.type = 'Deleted'
            item.color = 'red'
            item.icon = 'mdi-file-remove'
            tome_status.staged.deleted += 1
          }

          tome_status.staged.push(item)
        }))

      console.debug('[Git Repository Status Reload] Load Working Tree')
      ops.show = git.Status.SHOW.WORKDIR_ONLY
      ops.flags = git.Status.OPT.INCLUDE_UNTRACKED + git.Status.OPT.RECURSE_UNTRACKED_DIRS
      const load_working_tree = store.state.tome.repository.getStatus(ops)
        .then(res => res.forEach(repo_status => {
          console.debug('[Git Repository Status Reload] Working Tree File', repo_status)

          const item = {
            path: repo_status.path()

          }

          if (repo_status.isNew()) {
            item.type = 'New'
            item.color = 'green'
            item.icon = 'mdi-file-star'
            tome_status.available.new += 1
          } else if (repo_status.isModified()) {
            item.type = 'Modified'
            item.color = 'green'
            item.icon = 'mdi-file-edit'
            tome_status.available.modified += 1
          } else if (repo_status.isRenamed()) {
            item.type = 'Renamed'
            item.color = 'green'
            item.icon = 'mdi-file-swap'
            tome_status.available.renamed += 1
          } else if (repo_status.isDeleted()) {
            item.type = 'Deleted'
            item.color = 'red'
            item.icon = 'mdi-file-remove'
            tome_status.available.deleted += 1
          }

          tome_status.available.push(item)
        }))

      return Promise.all([load_index, load_working_tree]).then(() => {
        store.state.tome.status = tome_status
        console.debug('[Git Repository Status Reload] Status Loaded', store.state.tome.status)

        if (tome_status.staged.new || tome_status.staged.modified || tome_status.staged.renamed || tome_status.staged.deleted) {
          console.debug('[Git Repository Status Reload] Flag Tome Ready')
          store.state.tome_ready = true
        }
      })
    },
    open_context: async function (e, type, path) {
      console.log('open_context', e, type, path)

      this.context.visible = true
      this.context.title = `${type} - ${path}`
      this.context.target = path
      this.context.items = []
      this.context.position.x = e.clientX
      this.context.position.y = e.clientY

      switch (type) {
        case 'folder':
          this.context.items.push({
            title: 'Expand',
            action: () => { console.log('Expand Action!') }
          })
          // fall through

        case 'file':
          this.context.items.push({
            title: 'New File',
            action: this.action_new_file
          })

          this.context.items.push({
            title: 'New Folder',
            action: this.action_new_folder
          })

          this.context.items.push({
            title: 'Open Folder',
            action: this.action_open_folder
          })

          break
      }
    },
    reload_selected_explorer: function () {
      // TODO: Reimplement reload behavior for explorer
    }
  },
  computed: {
    tome_file_rendered: function () {
      return ''
    },
    tome_file_path_rel: function () {
      return store.state.tome_file_path ? `${path.relative(store.state.tome.path, store.state.tome_file_path)}${path.sep}` : ''
    },
    tome_path: function () {
      return store.state.tome.path
    },
    add_target: function () {
      return this.add.relative_path || store.state.tome_file_path
    },
    tome: function () {
      return store.state.tome
    }
  },
  components: {
    SystemBar,
    EditorInterface,
    ActionBar,
    NewFileService,
    ContextMenuService
  }
}
</script>
