<template>
  <div>
    <utility-page
      ref="page"
      right
      title="Remotes"
      :layer="4"
      :open="system.remotes"
      @close="close"
    >
      <v-card
        class="mb-3 flex-grow-1 flex-shrink-1 d-flex flex-column"
        color="surface"
        title="Defined Remotes"
        subtitle="Below is the list of remotes that have been defined for this repository."
      >
        <v-sheet
          color="background"
          class="remote-list ma-1"
        >
          <v-list class="pa-0">
            <v-list-item
              v-for="remote in repository_remotes.list"
              :key="remote.name"
              class="remote-list-item pa-1"
              :title="remote.name"
              :subtitle="remote.url"
            >
              <template #append>
                <v-btn
                  variant="flat"
                  @click="remove_confirm(remote.name)"
                >
                  <v-icon>mdi-trash-can</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-card>
      <v-card
        class="mb-3"
        color="surface"
        title="Add Remote"
        subtitle="Create a new remote target by either providing the raw git command or the name and url for the remote"
      >
        <text-input
          label="Git Remote Add Command"
          placeholder="git remote add origin git@127.0.0.1:username/example.git"
          :value="remote_command"
          :error="remote_command_error"
          @update="(value) => remote_command = value"
        >
          <template #append>
            <v-btn
              style="height: 100%"
              @click="add_command"
            >
              Add
            </v-btn>
          </template>
        </text-input>
        <v-divider class="mx-6 my-2" />
        <v-row
          class="mb-2"
          dense
        >
          <v-col
            cols="12"
            sm="3"
          >
            <text-input
              label="Name"
              placeholder="Origin"
              :value="remote_name"
              :error="remote_name_error"
              @update="(value) => remote_name = value"
            />
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <text-input
              label="Target"
              :placeholder="remote_url_placeholder"
              :value="remote_url"
              :error="remote_url_error"
              @update="(value) => remote_url = value"
            >
              <template #append>
                <v-btn
                  style="height: 100%"
                  @click="add_manual"
                >
                  Add
                </v-btn>
              </template>
            </text-input>
          </v-col>
        </v-row>
      </v-card>
    </utility-page>
    <remote-remove-confirm
      :visible="remote_remove_confirm"
      :name="remote_remove_name"
      @remove="remove"
      @cancel="() => remote_remove_confirm = false"
    />
  </div>
</template>

<script lang="ts">
export const RemoteUrlPlaceholderInterval = 1500
export enum RemoteUrlPlaceholderValues {
  Git = 'git@127.0.0.1:username/example.git',
  Http = 'https://127.0.0.1/username/example.git',
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import UtilityPage from '@/components/UtilityPage.vue'
import TextInput from '@/components/Input/TextInput.vue'
import RemoteRemoveConfirm from '@/components/RemoteRemoveConfirm.vue'
import {
  VBtn,
  VCard,
  VCol,
  VDivider,
  VIcon,
  VList,
  VListItem,
  VRow,
  VSheet,
} from 'vuetify/components'
import { http as http_regex, git as git_regex } from '@/regex'

const system = fetch_system_store()
const repository_remotes = fetch_repository_remotes_store()

const remote_command = ref('')
const remote_command_error = ref(false)
const remote_name = ref('')
const remote_name_error = ref(false)
const remote_url = ref('')
const remote_url_error = ref(false)

const remote_remove_confirm = ref(false)
const remote_remove_name = ref('')

const remote_url_placeholder = ref('')
const remote_url_placeholder_toggle = ref(false)
const ticker = ref<ReturnType<typeof setTimeout>>()

onMounted(() => update_remote_url_placeholder())

onUnmounted(() => {
  if (ticker.value) {
    clearTimeout(ticker.value)
  }
})

function update_remote_url_placeholder () {
  if (remote_url_placeholder_toggle.value) {
    remote_url_placeholder_toggle.value = false
    remote_url_placeholder.value = RemoteUrlPlaceholderValues.Git
  } else {
    remote_url_placeholder_toggle.value = true
    remote_url_placeholder.value = RemoteUrlPlaceholderValues.Http
  }

  ticker.value = setTimeout(update_remote_url_placeholder, RemoteUrlPlaceholderInterval)
}

async function close () {
  await system.page({ remotes: false })
}

async function add_command () {
  remote_command_error.value = false

  if (remote_command.value.length === 0) {
    remote_command_error.value = true
  }

  let remote_command_name
  let remote_command_url

  try {
    [ , remote_command_name, remote_command_url ]
      = /^git remote add (\w+) (.+)$/.exec(remote_command.value)

    const valid
      = http_regex.test(remote_command_url)
      || git_regex.test(remote_command_url)

    if (!valid) {
      remote_command_error.value = true
    }
  } catch {
    remote_command_error.value = true
  }

  if (remote_command_error.value) {
    return
  }

  await repository_remotes.add({ name: remote_command_name, url: remote_command_url })
  remote_command.value = ''
}

async function add_manual () {
  remote_name_error.value = false
  remote_url_error.value = false

  if (remote_name.value.length === 0) {
    remote_name_error.value = true
  }

  if (remote_url.value.length === 0) {
    remote_url_error.value = true
  }

  if (remote_name_error.value || remote_url_error.value) {
    return
  }

  await repository_remotes.add({ name: remote_name.value, url: remote_url.value })

  remote_name.value = ''
  remote_url.value = ''
}

async function remove () {
  await repository_remotes.remove({ name: remote_remove_name.value })
  remote_remove_confirm.value = false
}

async function remove_confirm (name) {
  remote_remove_name.value = name
  remote_remove_confirm.value = true
}

defineExpose({
  add_command,
  add_manual,
  remove,
  remove_confirm,
  remote_url_placeholder,
  remote_command,
  remote_command_error,
  remote_name,
  remote_name_error,
  remote_url,
  remote_url_error,
  remote_remove_confirm,
  remote_remove_name,
  ticker,
})
</script>

<style scoped>
.remote-list {
  flex-grow: 1;
  flex-shrink: 1;
  height: 0;
  min-height: 180px;
  outline: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  overflow-y: scroll;
}

.remote-list-item {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}
</style>
