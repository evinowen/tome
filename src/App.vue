<template>
  <v-app id="inspire">
    <system-bar title="tome" @settings="settings = true" />
    <v-navigation-drawer v-model="settings" fixed temporary/>

    <editor-interface
      :tome=tome
      :configuration=tome_config
      :edit=tome_edit
      :commit=tome_commit
      :push=tome_push
      @commit:close="tome_commit = false"
      @push:close="tome_push = false"
      @context=open_context
    />

    <new-file-service
      :active="tome_add_file"
      @close="tome_add_file = false"
      @create="tome_file_selected.load()"
      :base="tome.path" :target="tome_add_file_path_rel || tome_file_path"
      :extension="tome_add_file_as_directory ? null : 'md'"
      :folder="tome_add_file_as_directory"
    />

    <context-menu-service
      v-model=context_menu_visible
      :title=context_menu_title
      :target=context_menu_target
      :items=context_menu_items
      :position_x=context_menu_position_x
      :position_y=context_menu_position_y
    />

    <action-bar
      :tome=tome
      :waiting=reload_counter
      :commit=tome_commit
      :push=tome_push
      @open=set_tome
      @edit="tome_edit = $event"
      @commit="tome_commit = true"
      @push="tome_push = true"
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
    tome: {
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
    tome_config: null,
    tome_file: '',
    tome_file_selected: '',
    tome_file_path: '',
    tome_file_data: '',
    tome_file_error: '',
    tome_file_actions: null,
    tome_file_actions_root: null,
    tome_edit: false,
    reload_triggered: false,
    reload_counter: 0,
    reload_max: 3,
    tome_status: {
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
    },
    tome_ready: false,
    tome_commit: false,
    tome_push: false,
    tome_add_file: false,
    tome_add_file_val: '',
    tome_add_file_path_rel: '',
    tome_add_file_as_directory: false,

    tome_app_config_path: '',
    tome_app_config_path_dir: '',

    context_menu_visible: false,
    context_menu_title: null,
    context_menu_target: null,
    context_menu_items: [],
    context_menu_position_x: 0,
    context_menu_position_y: 0

  }),
  mounted: async function () {
    this.tome_file_actions_root = [
      {
        name: 'New File',
        icon: 'mdi-file-star',
        action: (event) => {
          console.log('new file', event)
          this.tome_add_file_val = ''
          this.tome_add_file_path_rel = ''
          this.tome_add_file_as_directory = false
          this.tome_add_file = true
        }
      },
      {
        name: 'New Folder',
        icon: 'mdi-folder-star',
        action: (event) => {
          console.log('new folder', event)
          this.tome_add_file_val = ''
          this.tome_add_file_path_rel = ''
          this.tome_add_file_as_directory = true
          this.tome_add_file = true
        }
      },
      {
        name: 'Open Folder',
        icon: 'mdi-folder-move',
        action: (event) => {
          console.log('open folder', event)
          shell.openItem(this.tome.path)
        }
      }
    ]

    this.tome_file_actions = this.tome_file_actions_root

    this.tome_app_config_path_dir = path.join(remote.app.getPath('appData'), 'tome')

    let create_directory = false

    try {
      await new Promise((resolve, reject) => fs.lstat(this.tome_app_config_path_dir, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_directory = true
    }

    if (create_directory) {
      const err = await new Promise((resolve, reject) => fs.mkdir(this.tome_app_config_path_dir, { recursive: true }, (err) => err ? reject(err) : resolve(true)))

      if (err) {
        console.error(`Failure to create Tome configuration folder at ${this.tome_app_config_path_dir}`)
      }
    }

    this.tome_app_config_path = path.join(this.tome_app_config_path_dir, 'config.json')

    let create_file = false

    try {
      await new Promise((resolve, reject) => fs.lstat(this.tome_app_config_path, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_file = true
    }

    if (create_file) {
      const fd = await new Promise((resolve, reject) => fs.open(this.tome_app_config_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
      await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)))
    }

    await this.configure()
  },
  methods: {
    configure: async function (input) {
      const data = await new Promise((resolve, reject) => fs.readFile(this.tome_app_config_path, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

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

      this.tome_config = {
        name: '',
        email: '',
        private_key: '',
        public_key: '',
        passphrase: '',

        ...parsed

      }

      console.log('configuration complete', this.tome_config)
      return true
    },
    choose_tome: function (event) {
      this.$refs.tome.click()
    },
    open_commit: async function (event, test) {
      console.log('test!', event, test)
      // await this.reload_run()
      this.tome_commit = true
    },
    set_tome: async function (file_path) {
      this.tome.path = file_path
      this.tome.name = path.basename(this.tome.path)
      console.log(`Set Tome path to ${this.tome.path}`)

      if (fs.existsSync(path.join(this.tome.path, '.git'))) {
        this.tome.repository = await git.Repository.open(this.tome.path).catch(err => console.error(err))
      } else {
        this.tome.repository = await git.Repository.init(this.tome.path, 0)
      }

      if (!this.tome.repository) {
        this.tome.branch.error = 'No Repository!'
        return
      }

      if (this.tome.repository.headDetached()) {
        this.tome.branch.error = 'Head Detached'
        return
      }

      if (this.tome.repository.isMerging()) {
        this.tome.branch.error = 'Merging'
        return
      }

      if (this.tome.repository.isRebasing()) {
        this.tome.branch.error = 'Rebasing'
        return
      }

      console.log('Pass checks for repo.')

      if (this.tome.repository.headUnborn()) {
        console.log('Unborn repo.')
        const head_raw = fs.readFileSync(path.join(this.tome.path, '.git', 'HEAD'), 'utf8')
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
          this.tome.branch.name = head_parsed[1]
        }
      } else {
        console.log('Existing repo.')
        const branch = await this.tome.repository.head()

        console.log(branch)
        this.tome.branch.name = branch.shorthand()
        console.log(this.tome.branch.name)
      }
    },
    action_new_file: async function (target_path) {
      console.log('new file', target_path)
      this.tome_add_file_val = ''
      this.tome_add_file_path_rel = target_path
      this.tome_add_file_as_directory = false
      this.tome_add_file = true
    },
    action_new_folder: async function (target_path) {
      console.log('new folder', target_path)
      this.tome_add_file_val = ''
      this.tome_add_file_path_rel = target_path
      this.tome_add_file_as_directory = true
      this.tome_add_file = true
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

      this.tome_ready = false

      console.debug('[Git Repository Status Reload] Load Index')
      ops.show = git.Status.SHOW.INDEX_ONLY
      const load_index = this.tome.repository.getStatus(ops)
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
      const load_working_tree = this.tome.repository.getStatus(ops)
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
        this.tome_status = tome_status
        console.debug('[Git Repository Status Reload] Status Loaded', this.tome_status)

        if (tome_status.staged.new || tome_status.staged.modified || tome_status.staged.renamed || tome_status.staged.deleted) {
          console.debug('[Git Repository Status Reload] Flag Tome Ready')
          this.tome_ready = true
        }
      })
    },
    open_context: async function (e, type, path) {
      console.log('open_context', e, type, path)

      this.context_menu_visible = true
      this.context_menu_title = `${type} - ${path}`
      this.context_menu_target = path
      this.context_menu_items = []
      this.context_menu_position_x = e.clientX
      this.context_menu_position_y = e.clientY

      switch (type) {
        case 'folder':
          this.context_menu_items.push({
            title: 'Expand',
            action: () => { console.log('Expand Action!') }
          })

        case 'file':
          this.context_menu_items.push({
            title: 'New File',
            action: this.action_new_file
          })

          this.context_menu_items.push({
            title: 'New Folder',
            action: this.action_new_folder
          })

          this.context_menu_items.push({
            title: 'Open Folder',
            action: this.action_open_folder
          })

          break
      }
    }
  },
  computed: {
    tome_file_rendered: function () {
      return marked(this.tome_file_data)
    },
    tome_file_path_rel: function () {
      return this.tome_file_path ? `${path.relative(this.tome.path, this.tome_file_path)}${path.sep}` : ''
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
