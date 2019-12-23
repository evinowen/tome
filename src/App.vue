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
        <v-treeview dense
          @update:active="load_file"
          :items="tome_contents.children"
          :load-children="load_path"
          activatable
          item-disabled="disabled"
          transition
          style="cursor: pointer; user-select: none;"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon dense :color="item.color">
              {{ item.file ? item.icon : (open ? 'mdi-folder-open' : 'mdi-folder') }}
            </v-icon>
          </template>
        </v-treeview>
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
        <v-content v-else>
          <v-container
            class="fill-height"
            fluid
          >
            <v-row
              justify="center"
              align="center"
            >
              <v-col>
                <EmptyContent>{{ tome_file_error || "Unknown Error." }}</EmptyContent>
              </v-col>
            </v-row>
          </v-container>
        </v-content>
      </template>
    </split-pane>

    <v-content v-else>
      <v-container
        class="fill-height"
        fluid
      >
        <v-row
          justify="center"
          align="center"
        >
          <v-col>
            <EmptyContent>No Folder Selected</EmptyContent>
          </v-col>
        </v-row>
      </v-container>
    </v-content>


    <v-footer app dark
      color="grey darken-3" class="pa-0"
    >
      <v-btn tile color="red" class="pa-0" min-width=36 @click.stop="choose_tome">
        <v-icon>mdi-bookshelf</v-icon>
      </v-btn>
      <input ref="tome" type="file" style="display: none" webkitdirectory @change="set_tome" />

      <template v-if="tome_path">

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn tile icon class="pa-0 px-2" min-width=36 v-on="on">{{ tome_name }}</v-btn>

          </template>
          <span>{{ tome_path }}</span>
        </v-tooltip>



        <v-btn v-if="tome_branch" tile class="px-2" color="primary">{{ tome_branch }}</v-btn>
        <v-btn v-else-if="tome_branch_error" tile class="pl-1 pr-2" color="error">
          <v-icon dark class="pr-1">mdi-alert-box</v-icon>
          {{ tome_branch_error }}
        </v-btn>
        <v-spacer></v-spacer>

        <template v-if="tome_edit">
          <v-menu top offset-y>
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
        </template>

        <v-switch v-model="tome_edit" dense inset hide-details class="my-0 ml-3"></v-switch>

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
  import { app, remote } from 'electron'
  import marked from 'marked'
  import EmptyContent from "./views/Empty.vue"

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
      tome_contents: [],
      tome_file: '',
      tome_file_data: '',
      tome_file_error: '',
      tome_branch: '',
      tome_branch_error: 'No Branch!',
      tome_repo: null,
      tome_edit: false,
      reload_triggered: false,
      reload_counter: 0,
      reload_max: 3,
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
    }),
    created() {
      let window = remote.BrowserWindow.getFocusedWindow();

      this.maximized = window.isMaximized();

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


        this.tome_path = files[0].path;
        this.tome_name = path.basename(this.tome_path);
        console.log(`Set Tome path to ${this.tome_path}`);

        if (fs.existsSync(path.join(this.tome_path, ".git"))) {
            this.tome_repo = await git.Repository.open(this.tome_path).catch(err => console.error(err));

        } else {
            this.tome_repo = await git.Repository.init(this.tome_path, 0);

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

        }

        this.reload_run();

        this.tome_contents = { path: this.tome_path, children: [] };


        await this.load_path(this.tome_contents);


      },
      commit_tome: async function (event) {
        this.tome_commit_working = true;

        let self = this;

        let index;
        let oid;

        let repo = this.tome_repo;

        await this.tome_repo.refreshIndex()
          .then(function(indexResult) {
            index = indexResult;
          })
          .then(function() {
            return index.writeTree();
          })
          .then(function(oidResult) {
            oid = oidResult;
            return git.Reference.nameToId(repo, "HEAD");
          })
          .then(function(head) {
            return repo.getCommit(head);
          })
          .then(function(parent) {
            var author = git.Signature.now("Test Test", "test@example.com");
            var committer = git.Signature.now("Test Test", "test@example.com");

            return repo.createCommit("HEAD", author, committer, "message", oid, [parent]);
          })
          .done(function(commitId) {
            console.log("New Commit: ", commitId);
          });

        self.tome_commit_confirm = false;
        self.tome_commit_working = false;
        self.tome_commit = false;

      },
      resize: function (event) {
      },
      load_path: async function (item) {
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
        return item.file ? null : new Promise((resolve, reject) => fs.readdir(
            item.path,
            { withFileTypes: true },
            (err, files) => err ? reject(err) : resolve(files)
          ))
          .then(children => children.map(
              child => ({
                path: path.join(item.path, child.name),
                name: child.name,
                file: child.isFile(),
                ...file_ext(path.extname(child.name).toLowerCase()),
              })
            )
          )
          .then(children => {
            children.forEach(child => {
              child.id = child.path;

              if (!child.file) {
                child.children = [];
              }

              if (!child.file) {
                if (!['.git'].includes(child.name)) {
                  child.disabled = false;

                }
              }

            });

            item.children.push(...children);

            return item.children;

          })
          .catch(err => console.warn(err));
      },
      load_file: async function (data) {
        this.tome_file = null;

        if (!data) {
          return;
        }

        let selected = data[0];

        if (!selected) {
          this.tome_file_error = `No File has been selected.`;
          return;
        }

        let ext = path.extname(selected).toLowerCase();


        if (ext != '.md') {
          this.tome_file_error = `File has invalid ${ext} extension.`;
          return;
        }

        this.tome_file = selected;

        this.tome_file_data = fs.readFileSync(selected, 'utf8');

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
          await this.reload_run();
          return

        }

        this.reload_counter = this.reload_counter - 1

        if (this.reload_counter >= 0) {
          this.reload_timeout = setTimeout(this.reload_update, 1000);

        }

      },
      reload_run: async function () {
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


        ops.show = git.Status.SHOW.INDEX_ONLY;
        (await this.tome_repo.getStatus(ops)).forEach(repo_status => {
          console.log(repo_status);

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

        });

        ops.show = git.Status.SHOW.WORKDIR_ONLY;
        (await this.tome_repo.getStatus(ops)).forEach(repo_status => {
          console.log(repo_status);

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

        });

        console.log(tome_status);
        if (tome_status.staged.new || tome_status.staged.modified || tome_status.staged.renamed || tome_status.staged.deleted) {
          this.tome_ready = true;

        }

        this.tome_status = tome_status;

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
    },
    components: {
      EmptyContent,
    },
  }
</script>
