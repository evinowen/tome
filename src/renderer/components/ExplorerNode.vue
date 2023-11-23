<template>
  <v-container
    v-show="visible"
    id="root"
    class="pa-0"
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
          @click="locked || $emit(directory ? 'toggle' : 'select', { path })"
        />
        <div class="flex-grow-1">
          <v-form
            ref="form"
            v-model="valid"
            class="explorer-input"
          >
            <v-text-field
              v-show="(selected && edit)"
              ref="input"
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
              ref="input"
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
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
    <div class="explorer-node-break" />
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VContainer, VLayout, VCol, VForm, VTextField } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import FileIcon from '@/components/FileIcon.vue'
import File from '@/store/modules/files/file'

export const ExplorerNodeGhostType = {
  FILE: 'file',
  DIRECTORY: 'directory',
  TEMPLATE: 'template',
  ACTION: 'action'
}

@Component({
  name: 'ExplorerNode',
  components: { VContainer, VLayout, VCol, VForm, VTextField, FileIcon },
  emits: [ 'toggle', 'select' ]
})
class ExplorerNode extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: '' })
  uuid: string

  @Prop({ default: false })
  enabled: boolean

  @Prop({ default: false })
  title: boolean

  @Prop({ default: '' })
  active: string

  @Prop({ default: false })
  edit: boolean

  @Prop({ default: undefined })
  format?: any

  @Prop({ default: false })
  root: boolean

  @Prop({ default: 0 })
  depth: number

  valid = false
  input = ''
  error?: string

  get file (): File {
    return this.store.state.files.directory[this.uuid] || File.Empty
  }

  get ephemeral () {
    return this.file.ephemeral
  }

  get name () {
    return this.file.name
  }

  get path () {
    return this.file.path
  }

  get extension () {
    return this.file.extension
  }

  get image () {
    return this.file.image
  }

  get relationship () {
    return this.file.relationship || ''
  }

  get children () {
    return this.file.children
  }

  get directory () {
    return this.file.directory
  }

  get expanded () {
    return this.file.expanded
  }

  get selected () {
    return this.uuid === this.active
  }

  get locked () {
    return this.relationship === 'git'
  }

  get system () {
    const relationships = new Set(['root', 'git', 'tome', 'tome-templates', 'tome-actions'])
    return relationships.has(this.relationship)
  }

  get actions () {
    return this.store.state.actions.options.map(name => ({
      title: name,
      action: (path) => this.$emit('action', { name, target: path, selection: undefined })
    }))
  }

  get templates () {
    return this.store.state.templates.options.map(name => ({
      title: name,
      action: (path) => this.$emit('template', { name, target: path })
    }))
  }

  get instance () {
    return this
  }

  get display () {
    if (this.title && !this.system) {
      try {
        return this.format(this.name, this.directory)
      } catch {
        return (this.ephemeral || this.name) ? this.name : ' - '
      }
    }

    return this.name
  }

  get visible () {
    return this.root || this.ephemeral || !(this.title && (this.display === '' || this.system))
  }

  get rules (): ((value: string) => boolean|string)[] {
    const rules:((value: string) => boolean|string)[] = [
      () => !this.error || this.error,
      (value) => String(value).search(/[^\s\w.-]/g) === -1 || 'special characters are not allowed.',
      (value) => String(value).search(/[.-]{2,}/g) === -1 || 'adjacent divider characters are not allowed.'
    ]

    if (this.title) {
      rules.push((value) => String(value).search(/[^\w- ]/g) === -1 || 'special characters are not allowed.')
    } else if (!this.directory) {
      rules.push(
        (value) => String(value).search(/\.\w+$/g) !== -1 || 'file extension is required.',
        (value) => String(value).search(/^.+\.\w+/g) !== -1 || 'file name is required.'
      )
    }

    return rules
  }

  get alert () {
    if (this.system || this.ephemeral) {
      return false
    }

    if (this.relationship === 'tome-file') {
      return false
    }

    try {
      this.format(this.name, this.directory)
    } catch {
      return true
    }

    return false
  }

  get context () {
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
        load: () => this.templates
      },
      {
        title: 'Action',
        load: () => this.actions
      }
    ]

    const special = []

    if (['root', 'tome', 'tome-feature-templates'].includes(this.relationship)) {
      special.push({
        title: 'New Template',
        action: async (path) => this.$emit('create', { type: ExplorerNodeGhostType.TEMPLATE, target: path })
      })
    }

    if (['root', 'tome', 'tome-feature-actions'].includes(this.relationship)) {
      special.push({
        title: 'New Action',
        action: async (path) => this.$emit('create', { type: ExplorerNodeGhostType.ACTION, target: path })
      })
    }

    const file = [
      {
        title: 'Open',
        action: (path) => this.$emit('open', { target: path })
      },
      {
        title: 'Open Folder',
        action: (path) => this.$emit('open', { target: path, container: true })
      },
      {
        title: 'New File',
        action: async (path) => this.$emit('create', { type: ExplorerNodeGhostType.FILE, target: path })
      },
      {
        title: 'New Folder',
        action: async (path) => this.$emit('create', { type: ExplorerNodeGhostType.DIRECTORY, target: path })
      }
    ]

    const clipboard = [
      {
        title: 'Cut',
        action: async (path) => await this.store.dispatch('clipboard/cut', { type: 'file', target: path }),
        active: () => !this.system
      },
      {
        title: 'Copy',
        action: async (path) => await this.store.dispatch('clipboard/copy', { type: 'file', target: path })
      },
      {
        title: 'Paste',
        active: () => this.store.state.clipboard.content,
        action: async (path) => await this.store.dispatch('clipboard/paste', { type: 'file', target: path })
      }
    ]

    const move = [
      {
        title: 'Rename',
        action: async (path) => this.$emit('edit', { target: path }),
        active: () => !this.system
      },
      {
        title: 'Delete',
        action: async (path) => this.$emit('delete', { target: path }),
        active: () => !this.system
      }
    ]

    push(this.directory ? expand : [])
    push(special.length > 0 && this.system ? special : [])
    push(this.system && !this.root ? [] : script)
    push(file)
    push(clipboard)
    push(move)

    return items
  }

  async contextmenu (event) {
    if (this.locked) {
      return
    }

    const position = {
      x: event.clientX,
      y: event.clientY
    }

    await this.store.dispatch('context/open', { target: this.path, title: this.path, items: this.context, position })
  }

  drag_start (event) {
    if (this.system) {
      event.preventDefault()
      return
    }

    event.dataTransfer.dropEffect = 'move'
    event.target.style.opacity = 0.2

    this.$emit('drag', { path: this.path })
  }

  drag_end (event) {
    event.target.style.opacity = 1
  }

  drag_enter (event) {
    const container = event.target.closest('[droppable]')
    container.classList.add('drop')
  }

  drag_leave (event) {
    const container = event.target.closest('[droppable]')
    container.classList.remove('drop')
  }

  drop (event) {
    this.drag_leave(event)
    this.$emit('drop', { path: this.path })
  }

  focus () {
    this.input = this.display
  }

  submit () {
    if (!this.valid) {
      return
    }

    this.$emit('submit', { input: this.input, title: this.title })
  }
}

export default toNative(ExplorerNode)
</script>

<style scoped>
#root :deep(*) {
  user-select: none;
}

.explorer-node {
  display: flex;
  white-space: nowrap;
  overflow: visible;
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
