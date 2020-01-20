<template>
  <v-app id="inspire">
    <system-bar title="tome" @settings="settings = true" />
    <v-navigation-drawer v-model="settings" fixed temporary/>

    <split-pane v-if="tome.path" v-on:resize="resize" :min-percent='5' :default-percent='25' split="vertical">
      <template slot="paneL">
        <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
          <scrolly-viewport>
            <explorer
              :name=tome.name
              :path=tome.path
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
              :repository="tome.repository"
              :available="tome_status.available"
              :staged="tome_status.staged"
              :default_name="tome_config.name"
              :default_email="tome_config.email"
            />


            <!-- PUSH WINDOW -->
            <push-view
              v-else-if="tome_push"
              @close="tome_push = false"
              :repository="tome.repository"
              :branch="tome.branch.name"
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
                  <div class="display-2">{{ tome.name }}</div>
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
      :base="tome.path" :target="tome_add_file_path_rel || tome_file_path"
      :extension="tome_add_file_as_directory ? null : 'md'"
      :folder="tome_add_file_as_directory"
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
html {
  font-size: 12px !important;

}

.v-icon.v-icon {
  font-size: 18px;

}

.v-treeview {
  font-size: 0.75em;
}

.v-treeview-node,
.v-treeview-node__root {
  min-height: 10px !important;
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
  import SystemBar from "./components/SystemBar.vue";
  import ActionBar from "./components/ActionBar.vue";

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
      settings: false,
      tome: {
        name: '',
        path: '',
        repository: null,
        branch: {
          name: '',
          error: '',
        },
        status: {
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
            shell.openItem(this.tome.path);

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
      choose_tome: function (event) {
        this.$refs.tome.click();
      },
      open_commit: async function (event, test) { console.log('test!', event, test);
        // await this.reload_run();
        this.tome_commit = true;
      },
      set_tome: async function (file_path) {
        this.tome.path = file_path;
        this.tome.name = path.basename(this.tome.path);
        console.log(`Set Tome path to ${this.tome.path}`);

        if (fs.existsSync(path.join(this.tome.path, ".git"))) {
            this.tome.repository = await git.Repository.open(this.tome.path).catch(err => console.error(err));

        } else {
            this.tome.repository = await git.Repository.init(this.tome.path, 0);

        }

        if (!this.tome.repository) {
          this.tome.branch.error = "No Repository!";
          return;

        }

        if (this.tome.repository.headDetached()) {
          this.tome.branch.error = "Head Detached";
          return;

        }

        if (this.tome.repository.isMerging()) {
          this.tome.branch.error = "Merging";
          return;

        }

        if (this.tome.repository.isRebasing()) {
          this.tome.branch.error = "Rebasing";
          return;

        }


        console.log(`Pass checks for repo.`);

        if (this.tome.repository.headUnborn()) {
          console.log(`Unborn repo.`);
          let head_raw = fs.readFileSync(path.join(this.tome.path, ".git", "HEAD"), 'utf8');
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
            this.tome.branch.name = head_parsed[1];

          }

        } else {
          console.log(`Existing repo.`);
          let branch = await this.tome.repository.head();

          console.log(branch);
          this.tome.branch.name = branch.shorthand();
          console.log(this.tome.branch.name);

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
        let load_index = this.tome.repository.getStatus(ops)
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
        let load_working_tree = this.tome.repository.getStatus(ops)
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
      tome_file_rendered: function () {
        return marked(this.tome_file_data);
      },
      tome_file_path_rel: function () {
        return this.tome_file_path ? `${path.relative(this.tome.path, this.tome_file_path)}${path.sep}` : '';
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
      SystemBar,
      ActionBar,
    },
  }
</script>
