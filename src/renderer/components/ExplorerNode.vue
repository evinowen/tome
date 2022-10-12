<template>
  <v-container
    v-show="visible"
    class="pa-0"
    style="user-select: none; clear: both;"
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
      <v-layout
        :class="['explorer-node', {'explorer-node-enabled': enabled && !system}, {'explorer-node-selected': selected}]"
        @click.left.stop="$emit('select', { path })"
        @click.right.stop="contextmenu"
      >
        <v-flex
          shrink
          class="explorer-node-indent"
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
        <v-flex>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-text-field
              v-show="(selected && edit)"
              ref="input"
              v-model="input"
              dense
              small
              autofocus
              :rules="rules"
              @blur="$emit('blur')"
              @focus="focus"
              @input="error = null"
              @keyup.enter="valid ? submit() : null"
            />
            <v-text-field
              v-show="!(selected && edit)"
              ref="input"
              :value="display"
              readonly
              dense
              small
              class="pa-0"
              @click.left.stop="$emit('select', { path })"
            />
          </v-form>
        </v-flex>
      </v-layout>
    </div>
    <div style="height: 2px;" />
    <v-container
      v-if="directory"
      v-show="expanded"
      class="explorer-node-container"
    >
      <explorer-node
        v-for="child in children"
        :key="child.uuid"
        :uuid="child.uuid"
        :ephemeral="child.ephemeral"
        :name="child.name"
        :path="child.path"
        :extension="child.extension"
        :image="child.image"
        :relationship="''.concat(child.relationship)"
        :children="child.children"
        :directory="child.directory"
        :expanded="child.expanded"

        :format="format"
        :active="active"
        :edit="edit"
        :enabled="enabled"
        :title="title"

        :depth="depth + 1"
        v-on="$listeners"
      />
    </v-container>

    <div class="explorer-node-break" />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { VContainer, VLayout, VFlex, VForm, VTextField } from 'vuetify/lib'
import store from '@/store'
import FileIcon from '@/components/FileIcon.vue'

export const ExplorerNodeGhostType = {
  FILE: 'file',
  DIRECTORY: 'directory',
  TEMPLATE: 'template',
  ACTION: 'action'
}

export default Vue.extend({
  name: 'ExplorerNode',
  components: { VContainer, VLayout, VFlex, VForm, VTextField, FileIcon },
  props: {
    uuid: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
    expanded: { type: Boolean, default: false },
    ephemeral: { type: Boolean, default: false },
    title: { type: Boolean, default: false },
    name: { type: String, default: '' },
    path: { type: String, default: '' },
    extension: { type: String, default: '' },
    image: { type: Boolean, default: false },
    relationship: { type: String, default: '' },
    active: { type: String, default: '' },
    edit: { type: Boolean, default: false },
    format: { type: Function, default: null },
    directory: { type: Boolean, default: true },
    children: { type: Array, default: () => [] },
    root: { type: Boolean, default: false },
    depth: { type: Number, default: 0 }
  },
  data: () => ({
    valid: false,
    input: '',
    error: null
  }),
  computed: {
    selected: function () {
      return this.uuid === this.active
    },
    locked: function () {
      return this.relationship === 'git'
    },
    system: function () {
      const relationships = new Set(['root', 'git', 'tome', 'tome-templates', 'tome-actions'])
      return relationships.has(this.relationship)
    },
    actions: function () {
      return store.state.actions.options.map(name => ({
        title: name,
        action: (path) => this.$emit('action', { name, target: path, selection: null })
      }))
    },
    templates: function () {
      return store.state.templates.options.map(name => ({
        title: name,
        action: (path) => this.$emit('template', { name, target: path })
      }))
    },
    instance: function () {
      return this
    },
    display: function () {
      if (this.title && !this.system) {
        try {
          return this.format(this.name, this.directory)
        } catch {
          return (this.ephemeral || this.name) ? this.name : ' - '
        }
      }

      return this.name
    },
    visible: function () {
      return this.root || this.ephemeral || !(this.title && (this.display === '' || this.system))
    },
    rules: function (): ((value: string) => boolean|string)[] {
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
    },
    alert: function () {
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
    },
    context: function () {
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
          action: null
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
          action: async (path) => await store.dispatch('clipboard/cut', { type: 'file', target: path }),
          active: () => !this.system
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
  },
  methods: {
    contextmenu: async function (event) {
      if (this.locked) {
        return
      }

      const position = {
        x: event.clientX,
        y: event.clientY
      }

      await store.dispatch('context/open', { target: this.path, title: this.path, items: this.context, position })
    },
    drag_start: function (event) {
      if (this.system) {
        event.preventDefault()
        return
      }

      event.dataTransfer.dropEffect = 'move'
      event.target.style.opacity = 0.2

      this.$emit('drag', { path: this.path })
    },
    drag_end: function (event) {
      event.target.style.opacity = 1
    },
    drag_enter: function (event) {
      const container = event.target.closest('[droppable]')
      container.classList.add('drop')
    },
    drag_leave: function (event) {
      const container = event.target.closest('[droppable]')
      container.classList.remove('drop')
    },
    drop: function (event) {
      this.drag_leave(event)
      this.$emit('drop', { path: this.path })
    },
    focus: function () {
      this.input = this.display
    },
    submit: function () {
      if (!this.valid) {
        return
      }

      this.$emit('submit', { input: this.input, title: this.title })
    }
  }
})
</script>

<style>

.explorer-node {
  min-height: 0 !important;
  padding: 0 !important;
  line-height: 12px !important;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: visible;
  user-select: none;
  vertical-align: text-bottom;
}

.explorer-node * {
  text-overflow: ellipsis;
  cursor: pointer !important;
}

.explorer-node .v-icon {
  font-size: 14px !important;
}

.explorer-node .v-btn,
.explorer-node input {
  position: relative;
  cursor: pointer !important;
}

.explorer-icon-badged {
  mask-image:
    radial-gradient(circle at calc(100% - 3px) calc(100% - 3px),
    rgba(0, 0, 0, 0) 4px, rgba(0, 0, 0, 1) 40%);
}

.explorer-node .v-btn .explorer-badge {
  position: absolute;
  bottom: -1.5px;
  right: -0.40px;
  font-size: 10px !important;
  background-blend-mode: overlay;
}

.explorer-node-break {
  height: 0px;
  width: 100%;
}

.explorer-node-drop {
  height: 18px;
  margin: 0;
  text-overflow: ellipsis;
}

.explorer-node-drop.drop {
  color: var(--v-accent-lighten4) !important;
  background: var(--v-accent-darken1) !important;
}

.explorer-node-drop.drop .v-btn,
.explorer-node-drop.drop input {
  color: var(--v-accent-lighten4) !important;
}

.explorer-node .v-input,
.explorer-node .v-input input {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 10px;
}

.explorer-node .v-input__slot {
  min-height: 0 !important;
  margin: 0 !important;
}

.explorer-node .v-input__slot::before {
  border-style: none !important;
}

.explorer-node .v-input__slot:after {
  border: none !important;
}

.explorer-node .v-text-field__details {
  margin-top: 20px;
  position: absolute !important;
  right: 0px;
  z-index: 1000;
}

.explorer-node .v-input__slot {
  padding: 0 !important;
}

.explorer-node .v-input__icon {
  height: 18px;
}

.explorer-node .v-input__prepend-inner {
  margin-top: 0 !important;
}

.explorer-node .v-input--is-disabled .v-text-field__details {
  display: none !important;
}

.explorer-node-container {
  border: none;
  width: auto !important;
  min-height: 8px;
  padding: 0 !important;
  margin: 0 !important;
}

.explorer-node:hover {
  background: var(--v-primary-darken2) !important;
}
.explorer-node:hover .v-btn,
.explorer-node:hover input {
  color: var(--v-primary-lighten4) !important;
}

.explorer-node-selected {
  background: var(--v-primary-darken3) !important;
}

.explorer-node-selected .v-btn,
.explorer-node-selected input {
  color: var(--v-primary-lighten3) !important;
}

.explorer-node-selected:hover {
  background: var(--v-primary-darken2) !important;
}

.explorer-node-selected:hover .v-btn,
.explorer-node-selected:hover input {
  color: var(--v-primary-lighten4) !important;
}

</style>
