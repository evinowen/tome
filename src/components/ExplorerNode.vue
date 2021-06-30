<template>
  <v-container class="pa-0" style="user-select: none; clear: both;" v-show="visible">
    <div ref=draggable class="explorer-node-drop" droppable :draggable="!(root || system)" @dragstart.stop=drag_start @dragend.stop=drag_end @dragenter.stop=drag_enter @dragover.prevent @dragleave.stop=drag_leave @drop.stop=drop>
      <v-layout
        v-bind:class="['explorer-node', {'explorer-node-enabled': enabled && !system}, {'explorer-node-selected': selected}]"
        @click.left.stop="system ? null : $emit('select', { path })"
        @click.right.stop="$emit('context', { instance, event: $event })"
      >
        <v-btn tile text x-small @click.stop="system ? null : $emit(directory ? 'toggle' : 'select', { path })" class="explorer-node-button mr-1">
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <v-flex>
          <v-form ref="form" v-model=valid>
            <v-text-field
              v-show="(selected && edit)"
              ref="input"
              v-model=input
              dense small autofocus
              :rules=rules
              @blur="$emit('blur', { context: instance })"
              @focus=focus
              @input="error = null"
              @keyup.enter="valid ? $emit('submit', { input, title }) : null"
            />
            <v-text-field
              @click.stop="$emit(directory ? 'toggle' : 'select', { path })"
              v-show="!(selected && edit)" ref="input" :value=display readonly dense small class="pa-0" />
          </v-form>
        </v-flex>
      </v-layout>
    </div>
    <div style="height: 2px;" />
    <v-container v-if=directory v-show=expanded class="explorer-node-container">

      <explorer-node
        v-for="child in children"
        :key=child.uuid
        :uuid=child.uuid
        :ephemeral=child.ephemeral
        :name=child.name
        :path=child.path
        :children=child.children
        :directory=child.directory
        :expanded=child.expanded

        :format=format
        :active=active
        :edit=edit
        :enabled=enabled
        :title=title

        v-on="$listeners"
      />
    </v-container>

    <div class="explorer-node-break" />
  </v-container>
</template>

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
}

.explorer-node .v-icon {
  font-size: 14px !important;
}

.explorer-node-break {
  height: 0px;
  width: 100%;
}

.explorer-node-drop {
  height: 18px;
  margin: 2px 2px 0 0;
  text-overflow: ellipsis;
}

.explorer-node-drop.drop {
  outline: 2px dashed #999;
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

.explorer-node-button {
  width: 18px !important;
  min-width: 18px !important;
  height: 18px !important;
  min-height: 18px !important;
  padding: 0 !important;
}

.explorer-node-container {
  border: dotted black;
  border-width: 0 0 0 1px;
  width: auto !important;
  min-height: 8px;
  padding: 0 0 0 4px !important;
  margin: 0 0 6px 4px !important;
}

.explorer-node:hover {
  background: var(--v-secondary-base) !important;
}
.explorer-node:hover .v-btn,
.explorer-node:hover input {
  color: var(--v-secondary-lighten5) !important;
}

.explorer-node-selected {
  background: var(--v-primary-base) !important;
}

.explorer-node-selected:hover {
  background: var(--v-primary-lighten1) !important;
}

.explorer-node-selected .v-btn,
.explorer-node-selected input {
  color: var(--v-primary-lighten5) !important;
}

</style>

<script>
import store from '@/store'

export default {
  name: 'ExplorerNode',
  props: {
    uuid: { type: String },
    enabled: { type: Boolean, default: false },
    expanded: { type: Boolean, default: false },
    ephemeral: { type: Boolean, default: false },
    title: { type: Boolean },
    name: { type: String, default: '' },
    path: { type: String },
    active: { type: String },
    edit: { type: Boolean },
    format: { type: Function },
    directory: { type: Boolean, default: true },
    children: { type: Array },
    root: { type: Boolean }
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
    context: function () {
      return [
        {
          title: 'Expand',
          action: null
        },
        {
          divider: true,
          title: 'Template',
          load: this.load_templates
        },
        {
          title: 'Action',
          items: this.actions,
          load: this.load_actions
        },
        {
          divider: true,
          title: 'Open',
          action: (path) => this.$emit('open', { type: 'file', target: path })
        },
        {
          title: 'Open Folder',
          action: (path) => this.$emit('open', { type: 'file', target: path, parent: true })
        },
        {
          title: 'New File',
          action: async (path) => this.$emit('create', { type: 'file', target: path, directory: false })
        },
        {
          title: 'New Folder',
          action: async (path) => this.$emit('create', { type: 'file', target: path, directory: true })
        },
        {
          divider: true
        },
        {
          title: 'Cut',
          action: (path) => store.dispatch('cut', { type: 'file', target: path })
        },
        {
          title: 'Copy',
          action: (path) => store.dispatch('copy', { type: 'file', target: path })
        },
        {
          title: 'Paste',
          active: () => store.state.clipboard.content,
          action: (path) => store.dispatch('paste', { type: 'file', target: path })
        },
        {
          divider: true
        },
        {
          title: 'Rename',
          action: async (path) => this.$emit('edit', { target: path })
        },
        {
          title: 'Delete',
          action: async (path) => this.$emit('delete', { target: path })
        }
      ]
    },
    instance: function () {
      return this
    },
    system: function () {
      return [
        '.git',
        '.tome'
      ].indexOf(this.name) > -1
    },
    icon: function () {
      try {
        this.format(this.name, this.directory)

        if (this.directory) {
          if (this.root) {
            return this.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
          }

          return this.expanded ? 'mdi-folder-open' : 'mdi-folder'
        }

        return 'mdi-file'
      } catch (e) {
        if (this.directory) {
          return this.expanded ? 'mdi-folder-open-outline' : 'mdi-folder-outline'
        }

        return 'mdi-file-outline'
      }
    },
    display: function () {
      if (this.title && !this.system) {
        try {
          return this.format(this.name, this.directory)
        } catch (e) {
          return (this.ephemeral || this.name) ? this.name : ' - '
        }
      }

      return this.name
    },
    visible: function () {
      return this.ephemeral || !(this.title && (this.display === '' || this.system))
    },
    rules: function () {
      if (this.title) {
        return [
          (value) => !this.error || this.error,
          (value) => String(value).search(/[^\w ]/g) === -1 || 'No special characters are allowed.'
        ]
      }

      return [
        (value) => !this.error || this.error,
        (value) => String(value).search(/[^\S ]/g) === -1 || 'No whitespace is allowed.',
        (value) => String(value).search(/[^\w. ]/g) === -1 || 'No special characters are allowed.'
      ]
    }
  },
  methods: {
    drag_start: function (event) {
      event.dataTransfer.dropEffect = 'move'
      event.target.style.opacity = 0.2

      this.$emit('drag', { path: this.path })
    },
    drag_end: function (event) {
      event.target.style.opacity = 1
    },
    drag_enter: function (event) {
      let container = event.target

      for (let i = 8; container && i > 0; i--) {
        if (container.hasAttribute('droppable')) {
          container.classList.add('drop')
          break
        }

        container = container.parentElement
      }
    },
    drag_leave: function (event) {
      let container = event.target

      for (let i = 8; container && i > 0; i--) {
        if (container.hasAttribute('droppable')) {
          container.classList.remove('drop')
          break
        }

        container = container.parentElement
      }
    },
    drop: function (event) {
      this.drag_leave(event)
      this.$emit('drop', { path: this.path })
    },
    focus: function () {
      this.input = this.display
    },
    load_templates: async function (path, menu) {
      await store.dispatch('templates/load', { path: store.state.tome.path })
      return store.state.templates.options.map(name => ({
        title: name,
        action: (path) => this.$emit('template', { name, target: path })
      }))
    },
    load_actions: async function (path, menu) {
      await store.dispatch('actions/load', { path: store.state.tome.path })
      return store.state.actions.options.map(name => ({
        title: name,
        action: (path) => this.$emit('action', { name, target: path })
      }))
    }
  }
}
</script>
