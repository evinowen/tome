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
            <template v-else-if="tome_commit">
              <v-container style="height: 100%; padding: 0px;">
                <v-container class="pa-4" style="height: 100%; overflow: auto;">
                  <v-row no-gutters>
                    <v-col>
                      <h1>Commit</h1>
                    </v-col>
                    <v-col col=1 class="text-right">
                      <v-btn tile icon color="red" @click.stop="close_commit">
                        <v-icon>mdi-window-close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <hr />
                  <v-row>
                    <v-col>
                      <v-card>
                        <v-card-title class="pa-2">
                          Available
                        </v-card-title>
                        <v-data-table dense
                          :headers="tome_status_headers"
                          :items="tome_status.available"
                          :sort-by="['file']"
                          :hide-default-footer="true"
                          :items-per-page="tome_status.available.length"
                          class="my-2"
                        >
                          <template v-slot:item.type="{ item }">
                            <v-chip label small
                              class="ma-1 px-2 text-center"
                              :color="item.color"
                              text-color="white"
                              style="width: 100%;"
                            >
                              <v-icon small class="mr-1">{{ item.icon }}</v-icon>
                              {{ item.type }}
                            </v-chip>

                          </template>

                          <template v-slot:item.action="{ item }">
                            <v-btn tile icon @click.stop="stage_path(item.path)">
                              <v-icon>mdi-plus-thick</v-icon>
                            </v-btn>

                          </template>
                        </v-data-table>
                      </v-card>
                    </v-col>

                    <v-col>
                      <v-card>
                        <v-card-title class="pa-2">
                          Staged
                        </v-card-title>
                        <v-data-table
                          :headers="tome_status_headers"
                          :items="tome_status.staged"
                          :items-per-page="tome_status.staged.length"
                          :sort-by="['file']"
                          :hide-default-footer="true"
                          dense class="my-2"
                        >
                          <template v-slot:item.type="{ item }">
                            <v-chip label small
                              class="ma-1 px-2 text-center"
                              :color="item.color"
                              text-color="white"
                              style="width: 100%;"
                            >
                              <v-icon small class="mr-1">{{ item.icon }}</v-icon>
                              {{ item.type }}
                            </v-chip>

                          </template>


                          <template v-slot:item.action="{ item }">
                            <v-btn tile x-small icon @click.stop="reset_path(item.path)">
                              <v-icon>mdi-cancel</v-icon>
                            </v-btn>

                          </template>
                        </v-data-table>
                      </v-card>
                    </v-col>

                  </v-row>


                  <v-row>
                    <v-col>

                    <v-text-field
                      v-model="tome_commit_data.name"
                      label="Name"
                      :placeholder="tome_config.name"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="tome_commit_data.email"
                      label="E-mail"
                      :placeholder="tome_config.email"
                      required
                    ></v-text-field>
                    <v-textarea
                      v-model="tome_commit_data.message"
                      :counter="50"
                      label="Message"
                      required
                      clearable
                      auto-grow
                      rows=1
                      style="font-size: 2.5em; line-height: 1.2em !important;"
                    ></v-textarea>

                    </v-col>
                  </v-row>

                  <v-divider class="mt-4 mb-2"></v-divider>

                  <v-row>
                    <v-col>
                      <v-dialog v-model="tome_commit_confirm" persistent max-width="1200px">
                        <template v-slot:activator="{ on }">
                          <v-btn class="mr-4" v-on="on">
                            <v-icon class="mr-2">mdi-content-save</v-icon>
                            Save
                          </v-btn>
                        </template>
                        <v-card>
                          <v-card-title class="headline">{{ tome_commit_data.message }}</v-card-title>
                          <v-card-text class="text-right">{{ tome_commit_data.name || tome_config.name }} &lt;{{ tome_commit_data.email || tome_config.email }}&gt;</v-card-text>
                          <v-card-actions>
                            <v-btn
                              color="orange darken-1"
                              text @click="commit_tome"
                              :disabled="tome_commit_working"
                            >
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
                    </v-col>
                    <v-col class="text-right">
                      <v-btn color="red" @click.stop="close_commit">
                        <v-icon class="mr-2">mdi-cancel</v-icon>
                        Cancel
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-container>

            </template>

            <!-- PUSH WINDOW -->
            <template v-else-if="tome_push">
              <v-container style="height: 100%; padding: 0px;">
                <v-container class="pa-4" style="height: 100%; overflow: auto;">
                  <v-row no-gutters>
                    <v-col>
                      <h1>Push</h1>
                    </v-col>
                    <v-col col=1 class="text-right">
                      <v-btn tile icon color="red" @click.stop="close_push">
                        <v-icon>mdi-window-close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>

                  <hr />

                  <v-row no-gutters>
                    <v-col>

                      <v-card dense class="my-2">
                        <v-row no-gutters>
                          <v-col>
                            <input ref="tome_key" type="file" style="display: none" @change="set_key" />
                            <v-btn tile icon small dark :color="tome_key ? 'green' : 'red'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="choose_key">
                              <v-icon small>{{ tome_key ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
                              {{ tome_key }}
                            </v-btn>
                          </v-col>
                          <v-col cols=1>
                            <v-btn tile icon small dark :color="tome_config.private_key ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="tome_key = tome_config.private_key || tome_key">
                              <v-icon small>mdi-key</v-icon>
                            </v-btn>
                          </v-col>

                        </v-row>


                        <v-row no-gutters>
                          <v-col>
                            <input ref="tome_key_public" type="file" style="display: none" @change="set_key_public" />
                            <v-btn tile icon small dark :color="tome_key_public ? 'green' : 'red'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="choose_key_public">
                              <v-icon small>{{ tome_key_public ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
                              {{ tome_key_public }}
                            </v-btn>
                          </v-col>
                          <v-col cols=1>
                            <v-btn tile icon small dark :color="tome_config.public_key ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="tome_key_public = tome_config.public_key || tome_key_public">
                              <v-icon small>mdi-key</v-icon>
                            </v-btn>
                          </v-col>

                        </v-row>


                        <v-row no-gutters>
                          <v-col>
                            <v-text-field
                              v-model="tome_key_passphrase"
                              :append-icon="tome_key_passphrase_show ? 'mdi-eye' : 'mdi-eye-off'"
                              :type="tome_key_passphrase_show ? 'text' : 'password'"
                              hint="passphrase"
                              solo dense filled flat x-small clearable
                              height=28
                              class="passphrase" style="min-height: 0px;"
                              @click:append="tome_key_passphrase_show = !tome_key_passphrase_show"
                            />
                          </v-col>
                          <v-col cols=1>
                            <v-btn tile icon small dark :color="tome_config.passphrase ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="tome_key_passphrase = tome_config.passphrase || tome_key_passphrase">
                              <v-icon small>mdi-key</v-icon>
                            </v-btn>
                          </v-col>

                        </v-row>

                        <v-card-actions>
                          <v-select
                            :items="tome_repo_remotes_data"
                            label="Remote"
                            @change="select_remote"
                            :disabled="tome_key && tome_key_public ? false : true"
                            dense clearable class="mt-4"
                          >
                            <template v-slot:selection="data">
                              {{ data.item.name }}
                              <v-spacer />
                              <small>{{ data.item.url }}</small>
                            </template>
                            <template v-slot:item="data">
                              {{ data.item.name }}
                              <v-spacer />
                              {{ data.item.url }}
                            </template>
                            <template v-slot:append-outer>
                              <v-btn icon :color="tome_repo_remotes_edit ? 'orange' : 'grey'" @click.stop="tome_repo_remotes_edit = !tome_repo_remotes_edit">
                                <v-icon>mdi-square-edit-outline</v-icon>
                              </v-btn>
                            </template>
                          </v-select>
                        </v-card-actions>

                        <v-expand-transition>
                          <div v-show="tome_repo_remotes_edit" class="px-6">
                            <form>
                              <v-row dense background="red">
                                  <v-col cols="12" sm="3">
                                    <v-text-field
                                      v-model="tome_push_data.new_remote_name"
                                      label="Name"
                                      required dense
                                    />
                                  </v-col>
                                  <v-col cols="12" sm="9">
                                    <v-text-field
                                      v-model="tome_push_data.new_remote_url"
                                      label="URL"
                                      required dense
                                      append-outer-icon="mdi-plus-thick"
                                    >
                                      <template v-slot:append-outer>
                                        <v-btn icon color="green" @click.stop="add_remote">
                                          <v-icon>mdi-plus-thick</v-icon>
                                        </v-btn>
                                      </template>
                                    </v-text-field>
                                  </v-col>
                              </v-row>
                            </form>
                          </div>
                        </v-expand-transition>
                      </v-card>

                    </v-col>
                  </v-row>

                  <v-row align="center" justify="center">
                    <v-col>
                      <v-card  class="text-center">
                        <v-card-text>
                          <div class="title text--primary">&mdash;</div>
                          <hr/>
                          <div class="display-1 text--primary">{{ tome_branch }}</div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols=1 class="text-center pa-0" align-center>
                      <v-icon align-center x-large>mdi-chevron-right</v-icon>
                    </v-col>

                    <v-col>
                      <v-card class="text-center" :loading="tome_branch_reference_loading" :disabled="!tome_branch_reference">
                        <v-card-text v-if="tome_branch_reference">
                          <div class="title text--primary">{{ this.tome_branch_reference.name }}</div>
                          <hr/>
                          <div class="display-1 text--primary">{{ this.tome_branch_reference.short }}</div>
                        </v-card-text>
                        <v-card-text v-else>
                          <div class="title text--primary">&mdash;</div>
                          <hr/>
                          <div class="display-1 text--primary">&mdash;</div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                  </v-row>

                  <v-divider class="mt-4 mb-2"></v-divider>

                  <v-row>
                    <v-col>
                      <v-dialog v-model="tome_push_confirm" persistent max-width="1200px">
                        <template v-slot:activator="{ on }">
                          <v-btn class="mr-4" v-on="on"
                            :disabled="(tome_key && tome_key_public && tome_repo_remotes_selected) ? false : true"
                          >
                            <v-icon class="mr-2">mdi-upload-multiple</v-icon>
                            Push
                          </v-btn>
                        </template>
                        <v-card>
                          <v-card-title class="headline">Push</v-card-title>
                          <v-card-actions>
                            <v-btn
                              color="orange darken-1"
                              text @click="push_tome"
                              :disabled="tome_push_working"
                            >
                              <v-progress-circular
                                :indeterminate="tome_push_working"
                                :size="12"
                                :width="2"
                                color="orange darken-1"
                                class="mr-2"
                              ></v-progress-circular>
                              Proceed
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="darken-1" text @click="tome_push_confirm = false" :disabled="tome_push_working">
                              <v-icon class="mr-2">mdi-exit-to-app</v-icon>
                              Back
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>

                    <v-col class="text-right">
                      <v-btn color="red" @click.stop="close_push">
                        <v-icon class="mr-2">mdi-cancel</v-icon>
                        Cancel
                      </v-btn>

                    </v-col>
                  </v-row>

                </v-container>
              </v-container>

            </template>

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
                <v-btn
                  tile small icon
                  class="px-2 grey--text text--lighten-1"
                   @click.stop=""
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

              <!-- SAVE BUTTON -->
              <v-btn tile small icon color="primary" class="pa-0" @click.stop="open_commit" :disabled="tome_commit || tome_push">
                <v-icon small>mdi-content-save</v-icon>
              </v-btn>

              <!-- PUSH BUTTON -->
              <v-btn tile small icon color="accent" class="pa-0" @click.stop="open_push" :disabled="tome_commit || tome_push">
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

  import NewFileService from "./components/NewFileService.vue";

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
      tome_key: null,
      tome_key_public: null,
      tome_key_passphrase: null,
      tome_key_passphrase_show: false,
      tome_file: '',
      tome_file_selected: '',
      tome_file_path: '',
      tome_file_data: '',
      tome_file_error: '',
      tome_file_actions: null,
      tome_file_actions_root: null,
      tome_branch: '',
      tome_branch_error: 'No Branch!',
      tome_branch_reference: null,
      tome_branch_reference_loading: false,
      tome_repo: null,
      tome_repo_remotes: [],
      tome_repo_remotes_edit: false,
      tome_repo_remotes_selected: null,
      tome_edit: false,
      tome_auto_stage: true,
      reload_triggered: false,
      reload_counter: 0,
      reload_max: 3,
      tome_filetree: null,
      tome_status_headers: [
        { text: 'File', value: 'path' },
        { text: 'Type', value: 'type', align: 'right' },
        { text: '', value: 'action', align: 'right'},
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
        available: [],
        staged: [],
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
      tome_push: false,
      tome_push_working: false,
      tome_push_data: {
        new_remote_name: '',
        new_remote_url: '',

      },
      tome_push_confirm: false,
      tome_push_working: false,
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
      close_commit: function (event) {
        this.tome_commit = false;
      },
      publish_commit: function (event) {

      },
      open_push: async function (event) {

        this.tome_repo_remotes = await this.tome_repo.getRemotes();

        console.log("loaded remotes", this.tome_repo_remotes);

        this.tome_push = true;

      },
      close_push: function (event) {
        this.tome_push = false;
      },
      add_remote: async function (event) {
        console.log("add_remote", event);
        console.log(this.tome_push_data.new_remote_name, this.tome_push_data.new_remote_url);

        let remote = await git.Remote.create(this.tome_repo, this.tome_push_data.new_remote_name, this.tome_push_data.new_remote_url);

        this.tome_repo_remotes = await this.tome_repo.getRemotes();

        console.log("loaded remotes", this.tome_repo_remotes);

      },
      remove_remote: function (event) {
        console.log("remove_remote", event);
      },
      choose_key: function (event) {
        this.$refs.tome_key.click();
      },
      set_key: async function (event) {
        console.log('set_key', event);
        let files = event.target.files || event.dataTransfer.files;

        console.log(files);

        if (!files.length) {
          this.tome_key = null;
          return;
        }

        if (!files[0].path) {
          return;
        }

        this.tome_key = files[0].path;

      },
      choose_key_public: function (event) {
        this.$refs.tome_key_public.click();
      },
      set_key_public: async function (event) {
        console.log('set_key', event);
        let files = event.target.files || event.dataTransfer.files;

        console.log(files);

        if (!files.length) {
          this.tome_key_public = null;
          return;
        }

        if (!files[0].path) {
          return;
        }

        this.tome_key_public = files[0].path;

      },
      select_remote: async function (remote) {
        console.log("select_remote", remote);

        this.tome_repo_remotes_selected = null;

        this.tome_branch_reference = null;
        this.tome_branch_reference_loading = true;

        // await new Promise(resolve => setTimeout(resolve, 5000));

        if (remote) {
          try {
            let credentials = { private_key: this.tome_key, public_key: this.tome_key_public, passphrase: this.tome_key_passphrase || '' };
            let result = await remote.object.connect(
              git.Enums.DIRECTION.FETCH,
              {
                credentials: function(url, username) {
                  console.log('credentials', username, credentials.public_key, credentials.private_key, credentials.passphrase);
                  return git.Cred.sshKeyNew(username, credentials.public_key, credentials.private_key, credentials.passphrase);
                },

                certificateCheck: () => 0,

              }
            );

            if (result) {
              console.error('remote connect error', result);

            }

            console.log("getFetchRefspecs?", await remote.object.getFetchRefspecs());
            console.log("getPushRefspecs?", await remote.object.getPushRefspecs());

            console.log("referenceList?", (await remote.object.referenceList()).map(reference => {
              let object = {
                name: reference.name(),
                object: reference,

              };

              let head_parsed = reference.name().match(/^refs\/heads\/(.*)$/m);
              console.log(head_parsed);

              if (head_parsed) {
                object.short = head_parsed[1];

                if (object.short == this.tome_branch) {
                  this.tome_branch_reference = object;
                }

              }

              return object;

            }));

            this.tome_repo_remotes_selected = remote;

          } catch (err) {
              console.error('remote connect error!!!', err);

          }

        }

        this.tome_branch_reference_loading = false;

        return true;

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
        let signature = git.Signature.now(this.tome_commit_data.name || this.tome_config.name,  this.tome_commit_data.email || this.tome_config.email);

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
      push_tome: async function (event) {
        console.debug("[Push Tome] Begin");
        this.tome_push_working = true;

        await new Promise(resolve => setTimeout(resolve, 5000));


        if (!this.tome_repo_remotes_selected) {
          console.debug("[Push Tome] No Remote Selected!", this.tome_repo_remotes_selected);
          this.tome_push_confirm = false;
          this.tome_push_working = false;

          return false;

        }

        let references = (await this.tome_repo.getReferences()).map(reference => ({
          name: reference.name(),
          object: reference,

        }));

        console.log("[Push Tome] List local references:", references);

        let refspec = `refs/heads/${this.tome_branch}:refs/heads/${this.tome_branch}`;
        let credentials = { private_key: this.tome_key, public_key: this.tome_key_public, passphrase: this.tome_key_passphrase || '' };

        console.debug("[Push Tome] Collect Data", refspec, credentials);

        let result = await this.tome_repo_remotes_selected.object.push(
          [refspec],
          {
            callbacks: {
              credentials: function(url, username) {
                console.log('credentials', username, credentials.public_key, credentials.private_key, credentials.passphrase);
                return git.Cred.sshKeyNew(username, credentials.public_key, credentials.private_key, credentials.passphrase);
              },

            }
          }
        );

        console.debug("[Push Tome] Clear Flags");
        this.tome_push_confirm = false;
        this.tome_push_working = false;
        this.tome_push = false;

        console.debug("[Push Tome] Complete");
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
        let file_path = path.join(this.tome_path, this.tome_add_file_path_rel || this.tome_file_path_rel, this.tome_add_file_val);

        if (!this.tome_add_file_as_directory) {
          file_path = `${file_path}.md`;

        }

        console.log(file_path);


        if (this.tome_add_file_as_directory) {

          let err = await new Promise((resolve, reject) => fs.mkdir(file_path, { recursive: true }, (err) => err ? reject(err) : resolve(true)))

          if (err) {
            console.error(`Failure to create folder at ${file_path}`);

          }

        } else {
          let fd = await new Promise((resolve, reject) => fs.open(file_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
          await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)));

        }

        this.tome_add_file = false;

        console.log(this.tome_file_selected);
        this.tome_file_selected.load();

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
      stage_path: async function (target_path) {
        let file_path = path.join(this.tome_path, target_path);
        console.log(`stage path ${file_path}`);

        let index = await this.tome_repo.refreshIndex();

        {
          let result = await index.addByPath(target_path);

          if (result) {
            console.error(`Failed to add ${target_path} to index`, result);
            return;

          }

        }

        {
          let result = await index.write();

          if (result) {
            console.error(`Failed to write ${target_path} index`, result);
            return;

          }

        }

        return await this.reload_run();

      },
      reset_path: async function (target_path) {
        let file_path = path.join(this.tome_path, target_path);
        console.log(`reset path ${file_path}`);

        let index = await this.tome_repo.refreshIndex();

        {
          let result = await index.removeByPath(target_path);

          if (result) {
            console.error(`Failed to reset ${target_path}`, result);
            return;

          }

        }

        {
          let result = await index.write();

          if (result) {
            console.error(`Failed to write ${target_path} index`, result);
            return;

          }

        }

        return await this.reload_run();

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
      tome_path_comp: function () {
        return this.tome_path;
      },
      tome_repo_remotes_data: function () {
        return this.tome_repo_remotes.map(remote => ({
          name: remote.name(),
          url: remote.url(),
          object: remote,
        }))
      },
    },
    components: {
      Explorer,
      ActionContent,
      EmptyContent,
      Scrolly,
      ScrollyViewport,
      ScrollyBar,
      NewFileService,
    },
  }
</script>
