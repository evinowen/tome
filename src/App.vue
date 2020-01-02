<template>
  <v-app id="inspire">
    <v-system-bar window dark
      color="grey darken-3"
      class="white--text pa-0"
    >

      <v-btn tile icon
        @click.stop="settings = !settings"
      >
        <v-icon>mdi-settings</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <span>Tome Name - github.com/test/test</span>
      <v-spacer></v-spacer>

      <v-btn tile icon
        @click.stop="minimize_window"
      >
        <v-icon dark>mdi-window-minimize</v-icon>
      </v-btn>

      <v-btn tile icon
        @click.stop="maximize_window"
      >
        <v-icon v-if="maximized">mdi-window-restore</v-icon>
        <v-icon v-else>mdi-window-maximize</v-icon>
      </v-btn>

      <v-btn tile icon
        @click.stop="close_window"
      >
        <v-icon>mdi-window-close</v-icon>
      </v-btn>

    </v-system-bar>


    <v-navigation-drawer
      v-model="settings"
      fixed
      temporary
    />

    <split-pane v-if="folder_selected" v-on:resize="resize" :min-percent='5' :default-percent='25' split="vertical">
      <template slot="paneL">
        <explorer :path=tome_path :populate=load_path v-on:selected=load_file />
      </template>

      <template slot="paneR">
        <template v-if="tome_commit">
          <div style="height: 100%; padding-bottom: 36px;">
            <div class="pa-4" style="height: 100%; overflow: auto;">
              <h1>Commit</h1>
              <hr />
              <v-data-table
                :headers="tome_status_headers"
                :items="tome_status.items"
                :sort-by="['file']"
                dense
                class="elevation-1 my-4"
                :hide-default-footer="true"
              >
                <template v-slot:item.type="{ item }">
                  <v-chip label
                    class="ma-2"
                    :color="item.color"
                    text-color="white"
                  >
                    <v-avatar left>
                      <v-icon>{{ item.icon }}</v-icon>
                    </v-avatar>
                    {{ item.type }}
                  </v-chip>

                </template>
              </v-data-table>
              <form>
                <v-text-field
                  v-model="tome_commit_data.name"
                  label="Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="tome_commit_data.email"
                  label="E-mail"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="tome_commit_data.message"
                  :counter="50"
                  label="Message"
                  required
                ></v-text-field>




                <v-dialog v-model="tome_commit_confirm" persistent max-width="1200px">
                  <template v-slot:activator="{ on }">
                    <v-btn class="mr-4" v-on="on">
                      <v-icon class="mr-2">mdi-content-save</v-icon>
                      Save
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="headline">{{ tome_commit_data.message }}</v-card-title>
                    <v-card-text class="text-right">{{ tome_commit_data.name }} &lt;{{ tome_commit_data.email }}&gt;</v-card-text>
                    <v-card-actions>
                      <v-btn color="orange darken-1" text @click="commit_tome" :disabled="tome_commit_working">
                        <v-progress-circular
                          :indeterminate="tome_commit_working"
                          :size="12"
                          :width="2"
                          color="orange darken-1"
                          class="mr-2"
                        ></v-progress-circular>
                        Proceed
                      </v-btn>
                      <v-spacer></v-spacer>
                      <v-btn color="darken-1" text @click="tome_commit_confirm = false" :disabled="tome_commit_working">
                        <v-icon class="mr-2">mdi-exit-to-app</v-icon>
                        Back
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-btn color="red" @click.stop="close_commit">
                  <v-icon class="mr-2">mdi-cancel</v-icon>
                  Cancel
                </v-btn>
              </form>
            </div>
          </div>
        </template>
        <template v-else-if="tome_file">
          <codemirror
            v-if="tome_edit"
            :value="tome_file_data"
            style="height: 100%; padding-bottom: 36px;"
            @input="save_file"
          ></codemirror>
          <div v-else
            style="height: 100%;padding-bottom: 36px;"
          ><div style="height: 100%; overflow: auto">
            <div v-html="tome_file_rendered" class="pa-2" />
            </div>
          </div>
        </template>
        <v-content v-else style="height: 100%; padding-bottom: 36px;">
          <template v-if="tome_file_actions">
            <ActionContent :actions="tome_file_actions">
              {{ tome_file_error || ""}}
            </ActionContent>

          </template>
          <template v-else>
            <EmptyContent>{{ tome_file_error }} EMPTY</EmptyContent>
          </template>

        </v-content>
      </template>
    </split-pane>

    <v-content v-else>
      <EmptyContent>{{ tome_file_error || "" }}</EmptyContent>
    </v-content>

    <v-dialog v-model="tome_add_file" persistent>
      <v-card>
        <v-card-title class="headline">New File</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="tome_add_file_val"
            suffix=".md"
          >
            <template v-slot:label>
              <v-icon>mdi-file</v-icon>
              {{ tome_file_path_rel }}
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click.stop="tome_add_file = false">Cancel</v-btn>
          <v-btn color="green darken-1" text @click.stop="create_file">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-footer app dark
      color="grey darken-3" class="pa-0"
    >
      <input ref="tome" type="file" style="display: none" webkitdirectory @change="set_tome" />
      <v-btn tile color="red" class="pa-0" min-width=36 @click.stop="choose_tome">
        <v-icon>mdi-bookshelf</v-icon>
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
                <v-btn tile icon class="pa-0 px-2" min-width=36 v-on="{ ...on_hover, ...on_click }">
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
        <v-btn v-if="tome_branch" tile class="px-2" color="primary">{{ tome_branch }}</v-btn>
        <v-btn v-else-if="tome_branch_error" tile class="pl-1 pr-2" color="error">
          <v-icon dark class="pr-1">mdi-alert-box</v-icon>
          {{ tome_branch_error }}
        </v-btn>
        <v-spacer></v-spacer>


        <v-divider
          inset
          vertical
        ></v-divider>
        <v-switch v-model="tome_edit" dense inset hide-details class="edit_switch"></v-switch>
        <v-divider
          inset
          vertical
        ></v-divider>

        <v-expand-x-transition>
          <div v-show="tome_edit" style="overflow: hidden; ">
            <div
              class="grey darken-4"
              style="height: 36px"
            >
              <v-menu top offset-y transition="slide-y-reverse-transition">
                <template v-slot:activator="{ on }">
                  <v-btn
                    tile icon
                    class="px-2 grey--text text--lighten-1"
                    v-on="on"
                  >
                    <v-progress-circular
                      :value="(reload_counter * 100) / reload_max"
                      :size="12"
                      :width="2"
                      color="orange darken-1"
                      class="mr-2"
                    ></v-progress-circular>
                    <strong v-if="tome_status_staged_additions" class="green--text">{{ tome_status_staged_additions }}</strong>
                    <strong v-else>0</strong>
                    <strong>/</strong>
                    <strong v-if="tome_status.staged.deleted" class="red--text">{{ tome_status.staged.deleted }}</strong>
                    <strong v-else>0</strong>
                    <strong>&bull;</strong>
                    <strong v-if="tome_status_available_additions" class="lime--text">{{ tome_status_available_additions }}</strong>
                    <strong v-else>0</strong>
                    <strong>/</strong>
                    <strong v-if="tome_status.available.deleted" class="orange--text">{{ tome_status.available.deleted }}</strong>
                    <strong v-else>0</strong>
                  </v-btn>
                </template>
                <v-list dense dark>
                  <v-list-item
                    v-for="(item, index) in ['reset', 'commit', 'push']"
                    :key="index" dense dark
                  >
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-btn tile color="primary" class="pa-0" min-width=36 :disabled="!tome_ready" @click.stop="open_commit">
                <v-icon>mdi-content-save</v-icon>
              </v-btn>
              <v-btn tile color="accent" class="pa-0" min-width=36  :disabled="tome_commits_ahead > 0" @click.stop="push_commits">
                <v-icon>mdi-upload-multiple</v-icon>
              </v-btn>

            </div>
          </div>
        </v-expand-x-transition>

      </template>

    </v-footer>
  </v-app>
</template>

<style>

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
  margin: 0;
}

.edit_switch {
  margin: 0 !important;
}

.edit_switch .v-input--selection-controls__input {
  margin-left: 10px !important;
  margin-right: 0 !important;
}

.window-handle {
  -webkit-app-region: drag;
}

.splitter-paneL {
  overflow: auto;
  height: auto !important;
  top: 0;
  bottom: 0;
  margin-bottom: 36px;
}

.CodeMirror {
  border: 1px solid #eee;
  height: 100% !important;
}

</style>

<script>
  import { app, remote, shell } from 'electron'
  import marked from 'marked'

  import Explorer from "./views/Explorer.vue"
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
      tome_name: '',
      tome_path: '',
      // tome_contents: [],
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
      tome_filetree: null,
      tome_status_headers: [
        { text: 'File', value: 'path' },
        { text: 'Type', value: 'type', align: 'right', divider: true },
      ],
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
        items: [],
      },
      tome_ready: false,
      tome_commit: false,
      tome_commit_confirm: false,
      tome_commit_data: {
        name: '',
        email: '',
        message: '',
      },
      tome_commits_ahead: 0,
      tome_commit_working: false,
      tome_add_file: false,
      tome_add_file_val: '',
    }),
    mounted() {
      let window = remote.getCurrentWindow();

      this.maximized = window.isMaximized();

      this.tome_file_actions_root = [
        {
          name: "New File",
          icon: "mdi-file-star",
          action: (event) => {
            console.log("new file", event);
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

    },
    methods: {
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
      open_commit: function (event) {
        this.tome_commit = true;
      },
      close_commit: function (event) {
        this.tome_commit = false;
      },
      publish_commit: function (event) {

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
      commit_tome: async function (event) {
        console.debug("[Commit Tome] Begin");
        this.tome_commit_working = true;

        if (!this.tome_repo) {
          console.debug("Attempting to commit on non-existent repository.");

        }

        console.debug("[Commit Tome] Load Prerequisites.");
        let index = await this.tome_repo.refreshIndex();
        let oid = await index.writeTree();
        let parents = []

        if (!this.tome_repo.headUnborn()) {
          console.debug("[Commit Tome] Head born, fetch as parent.");
          let head = await git.Reference.nameToId(this.tome_repo, "HEAD");
          let parent = await this.tome_repo.getCommit(head);

          parents.push(parent);

        }

        console.debug("[Commit Tome] Create Signature");
        let signature = git.Signature.now(this.tome_commit_data.name,  this.tome_commit_data.email);

        console.debug("[Commit Tome] Await commit ... ");
        let commit = await this.tome_repo.createCommit("HEAD", signature, signature, this.tome_commit_data.message, oid, parents);

        console.debug("[Commit Tome] Committed", commit);

        console.debug("[Commit Tome] Clear Flags");
        this.tome_commit_confirm = false;
        this.tome_commit_working = false;
        this.tome_commit = false;

        console.debug("[Commit Tome] Complete");
        return true;

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
      create_file: async function (data) {
        let base_path = this.tome_file_selected.path;
        let file_path = path.join(this.tome_file_path ? this.tome_file_path : this.tome_path, `${this.tome_add_file_val}.md`);

        console.log(file_path);

        let fd = await new Promise((resolve, reject) => fs.open(file_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
        await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)));

        this.tome_add_file = false;

        console.log(this.tome_file_selected);
        this.tome_file_selected.load();

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
          this.reload_triggered = false;
          return await this.reload_run();

        }

        this.reload_counter = this.reload_counter - 1

        if (this.reload_counter >= 0) {
          this.reload_timeout = setTimeout(this.reload_update, 1000);

        }

      },
      reload_run: async function () {
        console.debug("[Git Repository Status Reload] Begin");

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
          items: [],
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

            tome_status.items.push(item);

          }));

        console.debug("[Git Repository Status Reload] Load Working Tree");
        ops.show = git.Status.SHOW.WORKDIR_ONLY;
        let load_working_tree = this.tome_repo.getStatus(ops)
          .then(res => res.forEach(repo_status => {
            console.debug("[Git Repository Status Reload] Working Tree File", repo_status);

            if (repo_status.isNew()) {
              tome_status.available.new += 1;

            }
            else if (repo_status.isModified()) {
              tome_status.available.modified += 1;

            }
            else if (repo_status.isRenamed()) {
              tome_status.available.renamed += 1;

            }
            else if (repo_status.isDeleted()) {
              tome_status.available.deleted += 1;

            }

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
      tome_status_available_additions: function () {
        if (this.tome_status) {
          return this.tome_status.available.new + this.tome_status.available.renamed + this.tome_status.available.modified;
        }

        return 0;

      },
      tome_status_staged_additions: function () {
        if (this.tome_status) {
          return this.tome_status.staged.new + this.tome_status.staged.renamed + this.tome_status.staged.modified;
        }

        return 0;

      },
      tome_file_path_rel: function () {
        return this.tome_file_path ? `${path.relative(this.tome_path, this.tome_file_path)}${path.sep}` : '';
      },
    },
    components: {
      Explorer,
      ActionContent,
      EmptyContent,
    },
  }
</script>
