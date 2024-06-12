<template>
  <div
    v-show="visible"
    class="root"
  >
    <explorer-node-pickup
      :path="file.path"
      :enabled="draggable"
    >
      <context
        ref="context"
        :load="async () => ExplorerNodeContextMenu(file)"
        :target="file.path"
        :class="[
          'explorer-node',
          {'explorer-node-visible': visible},
          {'explorer-node-selected': selected},
        ]"
        @click.left.stop="select"
        @keydown="keydown"
      >
        <div
          class="flex-shrink-0"
          :style="{ width: `${depth * 6}px`}"
        />
        <file-button-icon
          ref="button"
          class="mr-1"
          tabindex="-1"
          :file="file"
          :alert="alert"
          @click.stop="activate"
        />
        <explorer-node-edit-label
          :path="file.path"
          :active="edit"
          :value="display"
          :directory="file.directory"
          @exit="select"
        />
        <div
          v-show="!edit"
          class="explorer-display"
        >
          <p>{{ display }}</p>
        </div>
      </context>
    </explorer-node-pickup>
    <div
      v-if="file.directory"
      v-show="file.expanded"
      class="explorer-node-container"
    >
      <explorer-node
        v-for="child in file.children"
        :key="child.uuid"
        :uuid="child.uuid"

        :active="active"
        :enabled="enabled"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Context from './Context.vue'
import ExplorerNodeEditLabel from './ExplorerNodeEditLabel.vue'
import ExplorerNodePickup from './ExplorerNodePickup.vue'
import FileButtonIcon from '@/components/FileButtonIcon.vue'

export default {
  name: 'ExplorerNode',
  components: {
    Context,
    FileButtonIcon,
    ExplorerNodePickup,
    ExplorerNodeEditLabel,
  },
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'
import File, { FileRelationshipType } from '@/objects/File'
import ExplorerNodeContextMenu from '@/objects/context/menus/ExplorerNodeContextMenu'
import { format } from '@/modules/Titles'

export interface Properties {
  uuid: string
  enabled?: boolean
  active: string
  root?: boolean
  depth?: number
}

const properties = withDefaults(defineProps<Properties>(), {
  uuid: '',
  enabled: false,
  active: '',
  root: false,
  depth: 0,
})

const configuration = fetch_configuration_store()
const files = fetch_files_store()
const repository = fetch_repository_store()

const context = ref<typeof Context>()

const file = computed((): File => {
  return files.directory[properties.uuid] || File.Empty
})

const draggable = computed(() => {
  return ![
    properties.root,
    system.value,
    files.editing,
    !configuration.active.draggable_objects,
  ].includes(true)
})

const edit = computed(() => {
  return selected.value && files.editing
})

const selected = computed(() => {
  return properties.uuid === properties.active
})

watch(selected, () => {
  if (selected.value) {
    context.value.element.focus()
  }
})

watch(edit, () => {
  if (!edit.value && selected.value) {
    context.value.element.focus()
  }
})

const locked = computed(() => {
  return file.value.relationship === 'git'
})

const system = computed(() => {
  const relationships = new Set([ 'root', 'git', 'tome', 'tome-templates', 'tome-actions' ])
  return relationships.has(file.value.relationship)
})

const title_formatted = computed(() => configuration.active.format_explorer_titles)

const display = computed(() => {
  let name = file.value.name
  if (file.value.relationship === FileRelationshipType.Root) {
    name = repository.name
  }

  if (title_formatted.value && (!system.value || (file.value.relationship === FileRelationshipType.Root))) {
    try {
      return format(name, file.value.directory)
    } catch { /* empty */ }
  }

  return name || ' - '
})

const visible = computed(() => {
  if (!properties.root && system.value && !configuration.active.system_objects) {
    return false
  }

  return properties.root || file.value.ephemeral || !title_formatted.value || (title_formatted.value && (display.value !== ''))
})

const alert = computed(() => {
  if (system.value || file.value.ephemeral) {
    return false
  }

  if (file.value.relationship === 'tome-file') {
    return false
  }

  try {
    format(file.value.name, file.value.directory)
  } catch {
    return true
  }

  return false
})

async function keydown (event: KeyboardEvent) {
  if ([ 'Enter', ' ' ].includes(event.key)) {
    if (event.repeat) {
      return
    }

    await activate()
  }

  if (event.key === 'ArrowUp') {
    const nodes = [ ...document.querySelectorAll('.explorer-node-visible') ] as HTMLElement[]

    const index = nodes.indexOf(context.value.element)

    if (index > 0) {
      nodes[index - 1].focus()
    }
  }

  if (event.key === 'ArrowDown') {
    const nodes = [ ...document.querySelectorAll('.explorer-node-visible') ] as HTMLElement[]

    const index = nodes.indexOf(context.value.element)

    if (index + 1 < nodes.length) {
      nodes[index + 1].focus()
    }
  }
}

async function activate () {
  if (locked.value) {
    return
  }

  file.value.directory
    ? await toggle()
    : await select()
}

async function toggle () {
  await files.toggle({ path: file.value.path })
}

async function select () {
  await files.select({ path: file.value.path })
}

defineExpose({
  alert,
  activate,
  display,
  draggable,
  edit,
  locked,
  toggle,
  select,
  selected,
  system,
})
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
  align-items: stretch;
  white-space: nowrap;
  overflow-y: visible;
  overflow-x: hidden;
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
  background: rgba(var(--v-theme-primary), 0.8);
  color: rgb(var(--v-theme-on-primary));
  transition:
    background-color 300ms linear,
    color 300ms linear;
}

.explorer-node:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}

.explorer-display {
  align-items: center;
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  font-size: 0.8em;
  padding: 0;
  user-select: none;
  min-width: 0px;
}

.explorer-display p {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

</style>
