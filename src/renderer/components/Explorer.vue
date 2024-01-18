<template>
  <div
    v-if="root.path !== ''"
    class="root"
  >
    <explorer-node
      ref="explorer_root"
      root
      :uuid="root.uuid"
      :active="active"
      :edit="editing"
      :enabled="enabled"
      :title="configuration.format_titles"
      :format="format"

      @action="action"
      @blur="blur"
      @context="$emit('context', $event)"
      @create="create"
      @delete="delete_event"
      @drag="drag"
      @drop="drop"
      @edit="edit"
      @open="open"
      @paste="$emit('paste', $event)"
      @select="select"
      @submit="submit"
      @template="template"
      @toggle="toggle"
    />
  </div>
</template>

<script lang="ts">
import ExplorerNode from './ExplorerNode.vue'

export default {
  components: {
    ExplorerNode,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'
import File from '@/store/modules/files/file'
import { ExplorerNodeGhostType } from './ExplorerNode.vue'

const store = fetchStore()

const explorer_root = ref<typeof ExplorerNode>(undefined)
const hold = ref<{ path: string }>(undefined)

export interface Properties {
  enabled: boolean
}

withDefaults(defineProps<Properties>(), {
  enabled: false,
})

const configuration = computed(() => store.state.configuration)

const active = computed(() => {
  if (store.state.files.active === '') {
    return ''
  }

  const selected = store.state.files.directory[store.state.files.active]

  if (selected) {
    return selected.uuid
  }

  return ''
})

const editing = computed(() => {
  return store.state.files.editing
})

const root = computed((): File => {
  return store.state.files.directory[store.state.files.base] || File.Empty
})

function format (name, directory = false) {
  if (!name) {
    throw new Error('Name provided is falsey')
  }

  if (/[^\d.a-z-]/.test(name)) {
    throw new Error('Name contains invalid characters')
  }

  const words = String(name).split('.')

  if (words.length > 0 && !directory) {
    words.pop()
  }

  return words.map((item) => `${String(item).slice(0, 1).toUpperCase()}${item.slice(1)}`).join(' ').trim()
}

async function toggle (state) {
  const { path } = state

  await store.dispatch('files/toggle', { path })
}

async function select (state) {
  const { path } = state
  await store.dispatch('files/select', { path })
}

async function open (state) {
  const { target, container = false } = state

  await store.dispatch('files/open', { path: target, container })
}

async function edit (state) {
  await store.dispatch('files/edit', { path: state.target })
}

async function create (state) {
  const { type, target } = state

  switch (type) {
    case ExplorerNodeGhostType.FILE:
      await store.dispatch('files/ghost', { path: target, directory: false })
      break

    case ExplorerNodeGhostType.DIRECTORY:
      await store.dispatch('files/ghost', { path: target, directory: true })
      break

    case ExplorerNodeGhostType.TEMPLATE:
      await store.dispatch('templates/ghost')
      break

    case ExplorerNodeGhostType.ACTION:
      await store.dispatch('actions/ghost')
      break
  }
}

async function delete_event (state) {
  const { target } = state
  await store.dispatch('files/delete', { path: target })
}

async function submit (state) {
  await store.dispatch('files/submit', state)
}
async function blur () {
  await store.dispatch('files/blur')
}
async function template (state) {
  await store.dispatch('templates/execute', state)
}
async function action (state) {
  await store.dispatch('actions/execute', state)
}

async function drag (state) {
  hold.value = state
}

async function drop (state) {
  await store.dispatch('files/move', { path: hold.value.path, proposed: state.path })
}

defineExpose({
  action,
  active,
  blur,
  create,
  delete_event,
  edit,
  explorer_root,
  format,
  hold,
  open,
  select,
  template,
  toggle,
})
</script>

<style scoped>
.root {
  height: 100%;
  user-select: none;
}
</style>
