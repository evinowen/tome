<template>
  <div
    v-if="root.path !== ''"
    class="root"
    @click.right.stop="contextmenu"
  >
    <explorer-node
      ref="root-node"
      root
      :uuid="root.uuid"
      :active="active"
      :edit="editing"
      :enabled="enabled"
      :title="configuration.format_titles"
      :format="format"

      @blur="blur"
      @drag="drag"
      @drop="drop"
      @select="select"
      @submit="submit"
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
import ExplorerContextMenu from '@/context/ExplorerContextMenu'

export interface Properties {
  enabled: boolean
}

withDefaults(defineProps<Properties>(), {
  enabled: false,
})

const store = fetchStore()

const hold = ref<{ path: string }>(undefined)

const configuration = computed(() => store.state.configuration)

async function contextmenu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY,
  }

  const context = ExplorerContextMenu(store, root.value)

  await store.dispatch('context/open', { target: root.value.path, title: root.value.path, items: context, position })
}

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

async function blur () {
  await store.dispatch('files/blur')
}
async function drag (state) {
  hold.value = state
}

async function drop (state) {
  await store.dispatch('files/move', { path: hold.value.path, proposed: state.path })
}

async function select (state) {
  const { path } = state
  await store.dispatch('files/select', { path })
}

async function submit (state) {
  await store.dispatch('files/submit', state)
}

async function toggle (state) {
  const { path } = state

  await store.dispatch('files/toggle', { path })
}

defineExpose({
  active,
  blur,
  format,
  hold,
  open,
  select,
  toggle,
})
</script>

<style scoped>
.root {
  height: 100%;
  user-select: none;
}
</style>
