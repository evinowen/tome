<template>
  <v-app id="inspire">
    <v-system-bar window dark
      color="grey darken-3"
      class="white--text pa-0"
      height=28
      style="user-select: none;"
    >

      <v-btn tile icon small
        @click.stop="settings = !settings"
      >
        <v-icon small>mdi-settings</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <span>tome</span>
      <v-spacer></v-spacer>

      <v-btn tile icon small
        @click.stop="minimize_window"
      >
        <v-icon small>mdi-window-minimize</v-icon>
      </v-btn>

      <v-btn tile icon small
        @click.stop="maximize_window"
      >
        <v-icon small>{{ maximized ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
      </v-btn>

      <v-btn tile icon small
        @click.stop="close_window"
      >
        <v-icon small>mdi-window-close</v-icon>
      </v-btn>

    </v-system-bar>


    <v-navigation-drawer
      v-model="settings"
      fixed
      temporary
    />

    <split-pane v-if="folder_selected" v-on:resize="resize" :min-percent='5' :default-percent='25' split="vertical">
      <template slot="paneL">
        <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
          <scrolly-viewport>
            <explorer
              :name=tome_name
              :path=tome_path
              :populate=load_path
              v-on:selected=load_file
              :new_file=action_new_file
              :new_folder=action_new_folder
              :open_folder=action_open_folder
            />
          </scrolly-viewport>
          <scrolly-bar axis="y" style="margin-right: 2px;"></scrolly-bar>
          <scrolly-bar axis="x" style="margin-bottom: 2px;"></scrolly-bar>
        </scrolly>
      </template>

      <template slot="paneR">
        <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
          <scrolly-viewport>

            <template v-if="false" />

            <template v-else-if="!tome_edit">
              <div v-if="tome_file" style="height: 100%; padding: 0px;" >
                <div v-html="tome_file_rendered" class="pa-2" />
              </div>
              <template v-else>
                <EmptyContent></EmptyContent>
              </template>
            </template>


            <!-- COMMIT WINDOW -->
            <commit-view
              v-else-if="tome_commit"
              @close="tome_commit = false"
              :repository="tome_repo"
              :available="tome_status.available"
              :staged="tome_status.staged"
              :default_name="tome_config.name"
              :default_email="tome_config.email"
            />


            <!-- PUSH WINDOW -->
            <push-view
              v-else-if="tome_push"
              @close="tome_push = false"
              :repository="tome_repo"
              :branch="tome_branch"
              :default_private_key="tome_config.private_key"
              :default_public_key="tome_config.public_key"
              :default_passphrase="tome_config.passphrase"

            />


            <!-- OPEN FILE WINDOW -->
            <template v-else-if="tome_file">
              <codemirror
                :value="tome_file_data"
                style="height: 100%;"
                @input="save_file"
              />

            </template>

            <!-- ACTION OR ERROR MENUS -->
            <v-content v-else style="height: 100%; padding: 0px;">
              <template v-if="tome_file_actions">
                <ActionContent :actions="tome_file_actions">
                  <div class="display-2">{{ tome_name }}</div>
                  <hr />
                  <div class="title">{{ tome_file_path_rel }}</div>

                </ActionContent>

              </template>
              <template v-else>
                <EmptyContent>{{ tome_file_error }}</EmptyContent>
              </template>

            </v-content>

          </scrolly-viewport>
          <scrolly-bar axis="y"></scrolly-bar>
          <scrolly-bar axis="x"></scrolly-bar>
        </scrolly>


      </template>
    </split-pane>

    <v-content v-else>
      <EmptyContent>{{ tome_file_error || "" }}</EmptyContent>
    </v-content>

    <new-file-service
      :active="tome_add_file"
      @close="tome_add_file = false"
      @create="tome_file_selected.load()"
      :base="tome_path" :target="tome_add_file_path_rel || tome_file_path"
      :extension="tome_add_file_as_directory ? null : 'md'"
      :folder="tome_add_file_as_directory"
    />

    <v-footer app dark
      color="grey darken-3" class="pa-0"
      height=28
    >
      <input ref="tome" type="file" style="display: none" webkitdirectory @change="set_tome" />
      <v-btn tile icon small dark color="red" class="pa-0" @click.stop="choose_tome">
        <v-icon small>mdi-bookshelf</v-icon>
      </v-btn>
      <v-divider
        inset
        vertical
      ></v-divider>

      <template v-if="tome_path">
        <v-menu top offset-y transition="slide-y-reverse-transition">
          <template v-slot:activator="{ on: on_click }">
            <v-tooltip top>
              <template v-slot:activator="{ on: on_hover }">
                <v-btn tile icon small class="pa-0 px-2" v-on="{ ...on_hover, ...on_click }">
                  {{ tome_name }}
                </v-btn>

              </template>
              <span>{{ tome_path }}</span>
            </v-tooltip>

          </template>

          <v-list dark dense>
            <v-list-item
              v-for="(item, index) in [{
                name: 'Open Folder',
                text: 'Open Tome folder in a native file browser.',
                action: 'open_folder',
              }]"
              :key="index" dense dark
              @click.stop="run_repository_menu(item)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.text }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

        </v-menu>

        <v-divider
          inset
          vertical
        ></v-divider>
        <v-btn v-if="tome_branch" tile small icon class="px-2" color="primary">{{ tome_branch }}</v-btn>
        <v-btn v-else-if="tome_branch_error" tile small icon class="pl-1 pr-2" color="error">
          <v-icon small dark class="pr-1">mdi-alert-box</v-icon>
          {{ tome_branch_error }}
        </v-btn>
        <v-spacer></v-spacer>


        <v-divider
          inset
          vertical
        ></v-divider>
        <v-switch v-model="tome_edit" dense x-small inset hide-details class="edit_switch"></v-switch>
        <v-divider
          inset
          vertical
        ></v-divider>

        <v-expand-x-transition>
          <div v-show="tome_edit" style="overflow: hidden; ">
            <div class="grey darken-4" style="height: 28px">
              <!-- STAGE BUTTON -->
              <status-button
                :waiting="reload_counter"
                :available_new="tome_status.available.new"
                :available_renamed="tome_status.available.renamed"
                :available_modified="tome_status.available.modified"
                :available_removed="tome_status.available.deleted"
                :staged_new="tome_status.staged.new"
                :staged_renamed="tome_status.staged.renamed"
                :staged_modified="tome_status.staged.modified"
                :staged_removed="tome_status.staged.deleted"
              />

              <!-- SAVE BUTTON -->
              <v-btn tile small icon color="primary" class="pa-0" @click.stop="open_commit" :disabled="tome_commit || tome_push">
                <v-icon small>mdi-content-save</v-icon>
              </v-btn>

              <!-- PUSH BUTTON -->
              <v-btn tile small icon color="accent" class="pa-0" @click.stop="tome_push = true" :disabled="tome_commit || tome_push">
                <v-icon small>mdi-upload-multiple</v-icon>
              </v-btn>

            </div>
          </div>
        </v-expand-x-transition>

      </template>

    </v-footer>
  </v-app>
</template>

<style>
html {
  font-size: 12px !important;

}

.v-icon.v-icon {
  font-size: 18px;

}
/*
.v-system-bar .v-icon {
  font-size: 18px !important;

} */


.v-treeview {
  font-size: 0.75em;
}

.v-treeview-node,
.v-treeview-node__root {
  min-height: 10px !important;
}

.v-system-bar {
  -webkit-app-region: drag;
}

.v-system-bar button {
  -webkit-app-region: no-drag;
}

.v-system-bar .v-icon {
  margin: 0 !important;
}

.edit_switch {
  padding-top: 2px !important;
  margin: 0 !important;
}

.edit_switch .v-input--selection-controls__input {
  margin-left: 10px !important;
  margin-right: 0 !important;
}

.window-handle {
  -webkit-app-region: drag;
}

.splitter-paneL,
.splitter-paneR {
  overflow: hidden;
  height: auto !important;
  top: 0;
  bottom: 0;
  padding: 0!important;
  margin-bottom: 28px;
}

.splitter-pane-resizer {
  border-color: transparent !important;
}

.CodeMirror {
  border: 1px solid #eee;
  height: 100% !important;
}

.passphrase.v-input .v-input__slot {
  min-height: 0px !important;
  border-radius: 0px;
}

</style>

<script>
  import { remote, shell } from 'electron'
  import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly';
  import marked from 'marked'

  import CommitView from "./views/Commit.vue";
  import PushView from "./views/Push.vue";
  import NewFileService from "./components/NewFileService.vue";
  import StatusButton from "./components/StatusButton.vue";

  import Explorer from "./components/Explorer.vue"
  import EmptyContent from "./views/Empty.vue"
  import ActionContent from "./views/Action.vue"

  import git from 'nodegit'

  const fs = remote.require('fs');
  const crypto = remote.require('crypto');
  const path = remote.require('path');

  export default {
    props: {
      source: String,
    },
    data: () => ({
      maximized: true,
      settings: false,
      tome_config: null,
      tome_name: '',
      tome_path: '',
      tome_file: '',
      tome_file_selected: '',
      tome_file_path: '',
      tome_file_data: '',
      tome_file_error: '',
      tome_file_actions: null,
      tome_file_actions_root: null,
      tome_branch: '',
      tome_branch_error: 'No Branch!',
      tome_repo: null,
      tome_edit: false,
      reload_triggered: false,
      reload_counter: 0,
      reload_max: 3,
      tome_status: {
        staged: {
          new: 0,
          renamed: 0,
          modified: 0,
          deleted: 0,
        },
        available: {
          new: 0,
          renamed: 0,
          modified: 0,
          deleted: 0,
        },
        available: [],
        staged: [],
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

    }),
    mounted: async function() {
      let window = remote.getCurrentWindow();

      this.maximized = window.isMaximized();

      this.tome_file_actions_root = [
        {
          name: "New File",
          icon: "mdi-file-star",
          action: (event) => {
            console.log("new file", event);
            this.tome_add_file_val = '';
            this.tome_add_file_path_rel = '';
            this.tome_add_file_as_directory = false;
            this.tome_add_file = true;

          },
        },
        {
          name: "New Folder",
          icon: "mdi-folder-star",
          action: (event) => {
            console.log("new folder", event);
            this.tome_add_file_val = '';
            this.tome_add_file_path_rel = '';
            this.tome_add_file_as_directory = true;
            this.tome_add_file = true;

          },
        },
        {
          name: "Open Folder",
          icon: "mdi-folder-move",
          action: (event) => {
            console.log("open folder", event);
            shell.openItem(this.tome_path);

          },
        },
      ];

      this.tome_file_actions = this.tome_file_actions_root;

      this.tome_app_config_path_dir = path.join(remote.app.getPath('appData'), 'tome');

      let create_directory = false;
      try {
        let status = await new Promise((resolve, reject) => fs.lstat(this.tome_app_config_path_dir, (err, status) => err ? reject(err) : resolve(status)));

      } catch (err) {
        create_directory = true;

      }

      if (create_directory) {
          let err = await new Promise((resolve, reject) => fs.mkdir(this.tome_app_config_path_dir, { recursive: true }, (err) => err ? reject(err) : resolve(true)))

          if (err) {
            console.error(`Failure to create Tome configuration folder at ${this.tome_app_config_path_dir}`);

          }

      }

      this.tome_app_config_path = path.join(this.tome_app_config_path_dir, 'config.json');

      let create_file = false;
      try {
        let status = await new Promise((resolve, reject) => fs.lstat(this.tome_app_config_path, (err, status) => err ? reject(err) : resolve(status)));

      } catch (err) {
        create_file = true;

      }

      if (create_file) {
        let fd = await new Promise((resolve, reject) => fs.open(this.tome_app_config_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)));
        await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)));

      }

      await this.configure();

    },
    methods: {
      configure: async function (input) {

        let data = await new Promise(resolve => fs.readFile(this.tome_app_config_path, 'utf8', (err, data) => err ? reject(err) : resolve(data)));

        let parsed = {};

        try {
          parsed = JSON.parse(data);
          console.log('configuration loaded', parsed);

        } catch (err) {
          console.log('configuration load failed', err);

        }

        if (!parsed || typeof parsed !== 'object') {
          console.log('configuration parsed format error', parsed);
          parsed = {};

        }

        this.tome_config = {
          name: '',
          email: '',
          private_key: '',
          public_key: '',
          passphrase: '',

          ...parsed

        }

        console.log('configuration complete', this.tome_config);
        return true;

      },
      minimize_window: function (event) {
        let window = remote.BrowserWindow.getFocusedWindow();

        window.minimize();

      },
      maximize_window: function (event) {
        let window = remote.BrowserWindow.getFocusedWindow();

        if (window.isMaximized()) {
          window.restore();

          this.maximized = false;

        } else {
          window.maximize();

          this.maximized = true;

        }

      },
      close_window: function (event) {
        let window = remote.BrowserWindow.getFocusedWindow();

        window.close();

      },
      choose_tome: function (event) {
        this.$refs.tome.click();
      },
      run_repository_menu: function (item, event) {
        console.log(item);
        console.log(event);

        switch (item.action) {
        case 'open_folder':
          shell.openItem(this.tome_path);
          break;

        }

      },
      open_commit: async function (event) {
        await this.reload_run();
        this.tome_commit = true;
      },
      set_tome: async function (event) {
        let files = event.target.files || event.dataTransfer.files;

        console.log(files);

        if (!files.length) {
          this.tome_path = '';
          this.tome_repo = null;
          return;
        }

        if (!files[0].path) {
          return;
        }

        this.tome_branch_error = "Unknown Repo Error";

        this.tome_path = files[0].path;
        this.tome_name = path.basename(this.tome_path);
        console.log(`Set Tome path to ${this.tome_path}`);

        if (fs.existsSync(path.join(this.tome_path, ".git"))) {
            this.tome_repo = await git.Repository.open(this.tome_path).catch(err => console.error(err));

        } else {
            this.tome_repo = await git.Repository.init(this.tome_path, 0);

        }

        if (!this.tome_repo) {
          this.tome_branch_error = "No Repository!";
          return;

        }

        if (this.tome_repo.headDetached()) {
          this.tome_branch_error = "Head Detached";
          return;

        }

        if (this.tome_repo.isMerging()) {
          this.tome_branch_error = "Merging";
          return;

        }

        if (this.tome_repo.isRebasing()) {
          this.tome_branch_error = "Rebasing";
          return;

        }


        console.log(`Pass checks for repo.`);

        if (this.tome_repo.headUnborn()) {
          console.log(`Unborn repo.`);
          let head_raw = fs.readFileSync(path.join(this.tome_path, ".git", "HEAD"), 'utf8');
          console.log(head_raw);

          let head_line_index = head_raw.length;

          let head_line_index_n = head_raw.indexOf("\n");
          let head_line_index_r = head_raw.indexOf("\r");

          if (head_line_index_n >= 0) {
            head_line_index = Math.min(head_line_index_n, head_line_index);
          }

          if (head_line_index_r >= 0) {
            head_line_index = Math.min(head_line_index_r, head_line_index);
          }

          let head_trimmed = head_raw.substring(0, head_line_index);

          let head_parsed = head_trimmed.match(/^ref: refs\/heads\/(.*)$/m);
          console.log(head_parsed);

          if (head_parsed) {
            this.tome_branch = head_parsed[1];

          }

        } else {
          console.log(`Existing repo.`);
          let branch = await this.tome_repo.head();

          console.log(branch);
          this.tome_branch = branch.shorthand();
          console.log(this.tome_branch);

        }

      },
      resize: function (event) {
      },
      load_path: async function (item) {
        console.log('load_path', item);
        console.log('load_path directory?', item.directory);
        console.log('load_path path?', item.path);
        console.log('load_path children?', item.children);

        let file_ext = function(ext) {
          switch (ext) {
            case '.md':
              return { icon: 'mdi-file-code', disabled: false, color: 'blue' };

            case '.gif':
            case '.jpg':
            case '.jpeg':
            case '.png':
              return { icon: 'mdi-file-image', disabled: true, color: 'green' };
              return 'mdi-file-image';

            default:
              return { icon: 'mdi-file-remove', disabled: true };
          }
        }

        return !item.directory ? true : new Promise((resolve, reject) => fs.readdir(
            item.path,
            { withFileTypes: true },
            (err, files) => err ? reject(err) : resolve(files)
          ))
          .then(children => children.map(
              child => ({
                name: child.name,
                path: path.join(item.path, child.name),
                directory: child.isDirectory(),
                ...file_ext(path.extname(child.name).toLowerCase()),
              })
            )
          )
          .then(children => {
            children.forEach(child => {
              if (child.directory) {
                child.children = [];
                if (!['.git'].includes(child.name)) {
                  child.disabled = false;

                }
              }

            });

            item.children.push(...children);

            return true;

          })
          .catch(err => console.warn(err));
      },
      action_new_file:  async function (target_path) {
        console.log("new file", target_path);
        this.tome_add_file_val = '';
        this.tome_add_file_path_rel = target_path;
        this.tome_add_file_as_directory = false;
        this.tome_add_file = true;


      },
      action_new_folder:  async function (target_path) {
        console.log('new folder', target_path);
        this.tome_add_file_val = '';
        this.tome_add_file_path_rel = target_path;
        this.tome_add_file_as_directory = true;
        this.tome_add_file = true;

      },
      action_open_folder:  async function (path) {
        console.log('action_open_folder', path);
        shell.openItem(path);

      },
      load_file: async function (node) {
        this.tome_file_error = '';

        this.tome_file = null;
        this.tome_file_path = null;
        this.tome_file_actions = null;
        this.tome_file_selected = null;

        console.log('load_file', node);

        if (!node) {
          this.tome_file_actions = this.tome_file_actions_root;
          return;

        }

        this.tome_file_selected = node;
        this.tome_file_path = this.tome_file_selected.path;

        let status = await new Promise((resolve, reject) => fs.lstat(this.tome_file_path, (err, status) => err ? reject(err) : resolve(status)));

        if (status.isDirectory()) {
          this.tome_file_error = path.basename(this.tome_file_path);
          this.tome_file_actions = [
            {
              name: "New File",
              icon: "mdi-file-star",
              action: (event) => {
                console.log("new file", event);
                this.tome_add_file_val = '';
                this.tome_add_file_path_rel = '';
                this.tome_add_file_as_directory = false;
                this.tome_add_file = true;

              },
            },
            {
              name: "New Folder",
              icon: "mdi-folder-star",
              action: (event) => {
                console.log("new folder", event);
                this.tome_add_file_val = '';
                this.tome_add_file_path_rel = '';
                this.tome_add_file_as_directory = true;
                this.tome_add_file = true;

              },
            },
            {
              name: "Open Folder",
              icon: "mdi-folder-move",
              action: (event) => {
                console.log("open folder", event);
                shell.openItem(this.tome_file_path);

              },
            },
          ];
          return;

        }

        let ext = path.extname(this.tome_file_path).toLowerCase();

        if (ext != '.md') {
          this.tome_file_error = `File has invalid ${ext} extension.`;
          return;
        }

        this.tome_file = this.tome_file_path;

        this.tome_file_data = fs.readFileSync(this.tome_file_path, 'utf8');

      },
      save_file: async function (value) {
        fs.writeFileSync(this.tome_file, value);
        this.tome_file_data = value;

        this.reload_start();


      },
      reload_start: function () {
        clearTimeout(this.reload_timeout);

        this.reload_triggered = true;
        this.reload_counter = this.reload_max;

        this.reload_timeout = setTimeout(this.reload_update, 500);

      },
      reload_update: async function () {

        if (!this.reload_counter) {
          return await this.reload_run();

        }

        this.reload_counter = this.reload_counter - 1

        if (this.reload_counter >= 0) {
          this.reload_timeout = setTimeout(this.reload_update, 1000);

        }

      },
      reload_run: async function () {
        console.debug("[Git Repository Status Reload] Begin");

        clearTimeout(this.reload_timeout);
        this.reload_triggered = false;

        let tome_status = {
          staged: {
            new: 0,
            renamed: 0,
            modified: 0,
            deleted: 0,
          },
          available: {
            new: 0,
            renamed: 0,
            modified: 0,
            deleted: 0,
          },
          available: [],
          staged: [],
        };

        var ops = new git.StatusOptions();

        this.tome_ready = false;

        console.debug("[Git Repository Status Reload] Load Index");
        ops.show = git.Status.SHOW.INDEX_ONLY;
        let load_index = this.tome_repo.getStatus(ops)
          .then(res => res.forEach(repo_status => {
            console.debug("[Git Repository Status Reload] Index File", repo_status);

            let item = {
              path: repo_status.path(),

            };

            if (repo_status.isNew()) {
              item.type = 'New';
              item.color = 'green';
              item.icon = 'mdi-file-star';
              tome_status.staged.new += 1;

            }
            else if (repo_status.isModified()) {
              item.type = 'Modified';
              item.color = 'green';
              item.icon = 'mdi-file-edit';
              tome_status.staged.modified += 1;

            }
            else if (repo_status.isRenamed()) {
              item.type = 'Renamed';
              item.color = 'green';
              item.icon = 'mdi-file-swap';
              tome_status.staged.renamed += 1;

            }
            else if (repo_status.isDeleted()) {
              item.type = 'Deleted';
              item.color = 'red';
              item.icon = 'mdi-file-remove';
              tome_status.staged.deleted += 1;

            }

            tome_status.staged.push(item);

          }));

        console.debug("[Git Repository Status Reload] Load Working Tree");
        ops.show = git.Status.SHOW.WORKDIR_ONLY;
        ops.flags = git.Status.OPT.INCLUDE_UNTRACKED + git.Status.OPT.RECURSE_UNTRACKED_DIRS;
        let load_working_tree = this.tome_repo.getStatus(ops)
          .then(res => res.forEach(repo_status => {
            console.debug("[Git Repository Status Reload] Working Tree File", repo_status);

            let item = {
              path: repo_status.path(),

            };

            if (repo_status.isNew()) {
              item.type = 'New';
              item.color = 'green';
              item.icon = 'mdi-file-star';
              tome_status.available.new += 1;

            }
            else if (repo_status.isModified()) {
              item.type = 'Modified';
              item.color = 'green';
              item.icon = 'mdi-file-edit';
              tome_status.available.modified += 1;

            }
            else if (repo_status.isRenamed()) {
              item.type = 'Renamed';
              item.color = 'green';
              item.icon = 'mdi-file-swap';
              tome_status.available.renamed += 1;

            }
            else if (repo_status.isDeleted()) {
              item.type = 'Deleted';
              item.color = 'red';
              item.icon = 'mdi-file-remove';
              tome_status.available.deleted += 1;

            }

            tome_status.available.push(item);

        }));

        return Promise.all([load_index, load_working_tree]).then(() => {
          this.tome_status = tome_status;
          console.debug("[Git Repository Status Reload] Status Loaded", this.tome_status);

          if (tome_status.staged.new || tome_status.staged.modified || tome_status.staged.renamed || tome_status.staged.deleted) {
            console.debug("[Git Repository Status Reload] Flag Tome Ready");
            this.tome_ready = true;

          }

        });

      },
    },
    computed: {
      folder_selected: function () {
        return this.tome_path != '';
      },
      tome_file_rendered: function () {
        return marked(this.tome_file_data);
      },
      tome_file_path_rel: function () {
        return this.tome_file_path ? `${path.relative(this.tome_path, this.tome_file_path)}${path.sep}` : '';
      },
    },
    components: {
      Explorer,
      ActionContent,
      EmptyContent,
      Scrolly,
      ScrollyViewport,
      ScrollyBar,
      CommitView,
      PushView,
      NewFileService,
      StatusButton,
    },
  }
</script>
