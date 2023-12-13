<template>
  <v-container
    v-show="visible"
    class="root"
  >
    <div
      ref="draggable"
      class="explorer-node-drop"
      droppable
      :draggable="!(root || system)"
      @dragstart.stop="drag_start"
      @dragend.stop="drag_end"
      @dragenter.stop="drag_enter"
      @dragover.prevent.stop
      @dragleave.stop="drag_leave"
      @drop.stop="drop"
    >
      <div
        :class="['explorer-node', {'explorer-node-enabled': enabled && !system}, {'explorer-node-selected': selected}]"
        @click.left.stop="$emit('select', { path })"
        @click.right.stop="contextmenu"
      >
        <div
          class="explorer-node-indent flex-shrink-1"
          :style="{ width: `${depth * 6}px`}"
        />
        <file-icon
          class="mr-1"
          :path="path"
          :directory="directory"
          :extension="extension"
          :image="image"
          :relationship="relationship"
          :expanded="expanded"
          :alert="alert"
          @click="locked || (directory ? $emit('toggle', { path }) : $emit('select', { path }))"
        />
        <div class="flex-grow-1">
          <v-form
            ref="form"
            v-model="valid"
            class="explorer-input"
          >
            <v-text-field
              v-show="(selected && edit)"
              v-model="input"
              density="compact"
              variant="plain"
              rounded="0"
              autofocus
              :rules="rules"
              @blur="$emit('blur')"
              @focus="focus"
              @update:model-value="error = undefined"
              @keyup.enter="valid ? submit() : undefined"
            />
            <v-text-field
              v-show="!(selected && edit)"
              :model-value="display"
              readonly
              density="compact"
              variant="plain"
              rounded="0"
              class="pa-0"
              @click.left.stop="$emit('select', { path })"
            />
          </v-form>
        </div>
      </div>
    </div>
    <div style="height: 2px;" />
    <div
      v-if="directory"
      v-show="expanded"
      class="explorer-node-container"
    >
      <explorer-node
        v-for="child in children"
        :key="child.uuid"
        :uuid="child.uuid"

        :format="format"
        :active="active"
        :edit="edit"
        :enabled="enabled"
        :title="title"

        :depth="depth + 1"

        @action="$emit('action', $event)"
        @blur="$emit('blur', $event)"
        @create="$emit('create', $event)"
        @delete="$emit('delete', $event)"
        @drag="$emit('drag', $event)"
        @drop="$emit('drop', $event)"
        @edit="$emit('edit', $event)"
        @open="$emit('open', $event)"
        @select="$emit('select', $event)"
        @submit="$emit('submit', $event)"
        @template="$emit('template', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
    <div class="explorer-node-break" />
  </v-container>
</template>

<script lang="ts">
import File from '@/store/modules/files/file'
import FileIcon from '@/components/FileIcon.vue'
import {
  VCol,
  VContainer,
  VForm,
  VLayout,
  VTextField,
} from 'vuetify/components'

export const ExplorerNodeGhostType = {
  FILE: 'file',
  DIRECTORY: 'directory',
  TEMPLATE: 'template',
  ACTION: 'action'
}

export default {
  name: 'ExplorerNode',
  components: {
    FileIcon,
    VCol,
    VContainer,
    VForm,
    VLayout,
    VTextField,
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

let hold: { path: string }

export interface Props {
  uuid: string,
  enabled: boolean,
  title: boolean,
  active: string,
  edit: boolean,
  format?: any,
  root?: boolean,
  depth?: number,
}

const props = withDefaults(defineProps<Props>(), {
  uuid: '',
  enabled: false,
  title: false,
  active: '',
  edit: false,
  format: undefined,
  root: false,
  depth: 0,
})

const emit = defineEmits([
  'action',
  'blur',
  'create',
  'delete',
  'drag',
  'drop',
  'edit',
  'open',
  'select',
  'submit',
  'template',
  'toggle',
])

const input = ref<string>('')
const valid = ref<boolean>(false)
const error = ref<string>('')

const file = computed((): File => {
  return store.state.files.directory[props.uuid] || File.Empty
})

const ephemeral = computed(() => {
  return file.value.ephemeral
})

const name = computed(() => {
  return file.value.name
})

const path = computed(() => {
  return file.value.path
})

const extension = computed(() => {
  return file.value.extension
})

const image = computed(() => {
  return file.value.image
})

const relationship = computed(() => {
  return file.value.relationship || ''
})

const children = computed(() => {
  return file.value.children
})

const directory = computed(() => {
  return file.value.directory
})

const expanded = computed(() => {
  return file.value.expanded
})

const selected = computed(() => {
  return props.uuid === props.active
})

const locked = computed(() => {
  return relationship.value === 'git'
})

const system = computed(() => {
  const relationships = new Set(['root', 'git', 'tome', 'tome-templates', 'tome-actions'])
  return relationships.has(relationship.value)
})

const actions = computed(() => {
  return store.state.actions.options.map(name => ({
    title: name,
    action: (path) => emit('action', { name, target: path, selection: undefined })
  }))
})

const templates = computed(() => {
  return store.state.templates.options.map(name => ({
    title: name,
    action: (path) => emit('template', { name, target: path })
  }))
})

const display = computed(() => {
  if (props.title && !system.value) {
    try {
      return props.format(name.value, directory.value)
    } catch {
      return (ephemeral.value || name.value) ? name.value : ' - '
    }
  }

  return name.value
})

const visible = computed(() => {
  return props.root || ephemeral.value || !(props.title && (display.value === '' || system.value))
})

const rules = computed((): ((value: string) => boolean|string)[] => {
  const rules:((value: string) => boolean|string)[] = [
    () => !error.value || error.value,
    (value) => String(value).search(/[^\s\w.-]/g) === -1 || 'special characters are not allowed.',
    (value) => String(value).search(/[.-]{2,}/g) === -1 || 'adjacent divider characters are not allowed.'
  ]

  if (props.title) {
    rules.push((value) => String(value).search(/[^\w- ]/g) === -1 || 'special characters are not allowed.')
  } else if (!directory.value) {
    rules.push(
      (value) => String(value).search(/\.\w+$/g) !== -1 || 'file extension is required.',
      (value) => String(value).search(/^.+\.\w+/g) !== -1 || 'file name is required.'
    )
  }

  return rules
})

const alert = computed(() => {
  if (system.value || ephemeral.value) {
    return false
  }

  if (relationship.value === 'tome-file') {
    return false
  }

  try {
    props.format(name.value, directory.value)
  } catch {
    return true
  }

  return false
})

const context = computed(() => {
  const items = []
  const push = (array) => {
    if (items.length > 0) {
      items.push({ divider: true })
    }

    items.push(...array)
  }

  const expand = [
    {
      title: 'Expand',
      action: undefined
    }
  ]

  const script = [
    {
      title: 'Template',
      load: () => templates.value
    },
    {
      title: 'Action',
      load: () => actions.value
    }
  ]

  const special = []

  if (['root', 'tome', 'tome-feature-templates'].includes(relationship.value)) {
    special.push({
      title: 'New Template',
      action: async (path) => emit('create', { type: ExplorerNodeGhostType.TEMPLATE, target: path })
    })
  }

  if (['root', 'tome', 'tome-feature-actions'].includes(relationship.value)) {
    special.push({
      title: 'New Action',
      action: async (path) => emit('create', { type: ExplorerNodeGhostType.ACTION, target: path })
    })
  }

  const file = [
    {
      title: 'Open',
      action: (path) => emit('open', { target: path })
    },
    {
      title: 'Open Folder',
      action: (path) => emit('open', { target: path, container: true })
    },
    {
      title: 'New File',
      action: async (path) => emit('create', { type: ExplorerNodeGhostType.FILE, target: path })
    },
    {
      title: 'New Folder',
      action: async (path) => emit('create', { type: ExplorerNodeGhostType.DIRECTORY, target: path })
    }
  ]

  const clipboard = [
    {
      title: 'Cut',
      action: async (path) => await store.dispatch('clipboard/cut', { type: 'file', target: path }),
      active: () => !system.value
    },
    {
      title: 'Copy',
      action: async (path) => await store.dispatch('clipboard/copy', { type: 'file', target: path })
    },
    {
      title: 'Paste',
      active: () => store.state.clipboard.content,
      action: async (path) => await store.dispatch('clipboard/paste', { type: 'file', target: path })
    }
  ]

  const move = [
    {
      title: 'Rename',
      action: async (path) => emit('edit', { target: path }),
      active: () => !system.value
    },
    {
      title: 'Delete',
      action: async (path) => emit('delete', { target: path }),
      active: () => !system.value
    }
  ]

  push(directory.value ? expand : [])
  push(special.length > 0 && system.value ? special : [])
  push(system.value && !props.root ? [] : script)
  push(file)
  push(clipboard)
  push(move)

  return items
})

async function contextmenu (event) {
  if (locked.value) {
    return
  }

  const position = {
    x: event.clientX,
    y: event.clientY
  }

  await store.dispatch('context/open', { target: path.value, title: path.value, items: context.value, position })
}

function drag_start (event) {
  if (system.value) {
    event.preventDefault()
    return
  }

  event.dataTransfer.dropEffect = 'move'
  event.target.style.opacity = 0.2

  emit('drag', { path: path.value })
}

function drag_end (event) {
  event.target.style.opacity = 1
}

function drag_enter (event) {
  const container = event.target.closest('[droppable]')
  container.classList.add('drop')
}

function drag_leave (event) {
  const container = event.target.closest('[droppable]')
  container.classList.remove('drop')
}

function drop (event) {
  drag_leave(event)
  emit('drop', { path: path.value })
}

function focus () {
  input.value = display.value
}

function submit () {
  if (!valid.value) {
    return
  }

  emit('submit', { input: input.value, title: props.title })
}
</script>

<style scoped>
.root {
  padding: 0;
}

.root :deep(*) {
  user-select: none;
}

.explorer-node {
  display: flex;
  white-space: nowrap;
  overflow: visible;
}

.explorer-node,
.explorer-node :deep(*) {
  cursor: pointer;
}

.explorer-node:hover {
  background: rgba(var(--v-theme-primary), 0.5);
  color: rgb(var(--v-theme-on-primary));
  transition:
    background-color 300ms linear,
    color 300ms linear;
}

.explorer-node-selected,
.explorer-node-selected:hover {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  transition:
    background-color 300ms linear,
    color 300ms linear;
}

.explorer-input,
.explorer-input :deep(*) {
  height: 100%;
  display: flex;
  flex-grow: 1;
}

.explorer-input :deep(.v-field__input) {
  text-overflow: ellipsis;
  font-size: 0.6em;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-inline-start: 2px;
  padding-inline-end: 2px;
  min-height: 0;
  border: none;
  background: none;
  vertical-align: text-bottom;
}

.explorer-input :deep(.v-field__outline:before) {
  border-bottom: 0;
}

.explorer-input :deep(.v-field__outline:after) {
  border-bottom: 0;
}

.explorer-input :deep(.v-input__details) {
  display: none;
}
</style>
