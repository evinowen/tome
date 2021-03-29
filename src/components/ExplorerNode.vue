<template>
  <v-container class="pa-0" style="user-select: none; clear: both;" v-show="visible">
    <div ref=draggable class="explorer-node-drop" droppable :draggable="!(root || system)" @dragstart.stop=drag_start @dragend.stop=drag_end @dragenter.stop=drag_enter @dragover.prevent @dragleave.stop=drag_leave @drop.stop=drop>
      <v-layout class="explorer-node"
        v-bind:class="['explorer-node', {'explorer-node-enabled': enabled && !system}, {'explorer-node-selected': selected}]"
        @click.left.stop="system ? null : $emit('select', { path })"
        @click.right.stop="$emit('context', { instance, event: $event })"
      >
        <v-btn tile text x-small @click.stop="system ? null : $emit('toggle', { path })" class="explorer-node-button mr-1" :color="enabled && !system ? 'black' : 'grey'">
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <v-flex>
          <template v-if=system>{{ display }}</template>
          <v-form v-else ref="form" v-model=valid>
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
            <v-text-field v-show="!(selected && edit)" ref="input" :value=display disabled dense small />
          </v-form>
        </v-flex>
      </v-layout>
    </div>

    <v-container v-if="directory && expanded" class="explorer-node-container">
      <div style="height: 2px;" />
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
  height: 20px;
  position: relative;
  top: -2px;
  margin: -2px -2px -4px -2px;
  padding: 0 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: visible;
  user-select: none;
  vertical-align: text-bottom;
  color: grey;
}

.explorer-node-enabled {
  color: black;
}

.explorer-node-break {
  height: 0px;
  width: 100%;
}

.explorer-node-drop {
  height: 16px;
  margin: 2px;
}

.explorer-node-drop.drop {
  outline: 2px dashed #999;
}

.explorer-node .v-input,
.explorer-node .v-input input {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 12px;
  color: black;
}

.explorer-node .v-input__slot {
  margin: 0 !important;
}

.explorer-node .v-input__slot:before {
  border: none !important;
}

.explorer-node .v-text-field__details {
  margin-top: 20px;
  position: absolute !important;
  right: 0px;
  z-index: 1000;
}

.explorer-node .v-input--is-disabled .v-text-field__details {
  display: none !important;
}

.explorer-node .v-text-field__details .v-messages__wrapper {
  background: rgba(255, 255, 255, 0.8);
}

.explorer-node-button {
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
  padding: 0 !important;
}

.explorer-node-container {
  border: solid #C8C8C8;
  border-width: 0 0 0 1px;
  width: auto !important;
  padding: 0 0 0 4px !important;
  margin: 0 0 4px 4px !important;
}

.explorer-node:hover {
  background: rgba(180, 180, 180, 0.3);
}

.explorer-node-enabled.explorer-node:hover {
  background: rgba(150, 150, 150, 0.6);
}

.explorer-node-selected {
  background: rgba(180, 180, 180, 0.6);
}

.explorer-node-enabled.explorer-node-selected {
  background: rgba(244, 40, 30, 0.6);
}

.explorer-node-selected:hover {
  background: rgba(150, 150, 150, 0.6);
}

.explorer-node-enabled.explorer-node-selected:hover {
  background: rgba(255, 20, 10, 0.6);
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
      if (this.directory) {
        if (this.root) {
          return this.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
        }

        return this.expanded ? 'mdi-folder-open' : 'mdi-folder'
      }

      return 'mdi-file'
    },
    display: function () {
      if (this.title && !this.system) {
        return this.format(this.name, true)
      }

      return this.name
    },
    visible: function () {
      return !(this.title && (this.display === '' || this.system))
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
        (value) => String(value).search(/\s/g) === -1 || 'No whitespace is allowed.',
        (value) => String(value).search(/[^\w.]/g) === -1 || 'No special characters are allowed.'
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
