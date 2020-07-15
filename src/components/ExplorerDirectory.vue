<template>
  <v-container class="pa-0" style="user-select: none; clear: both;" v-show="visible">
    <div v-if=!leaf style="height: 2px;" />
    <div ref=draggable class="explorer-directory-drop" droppable :draggable="leaf && !system" @dragstart.stop=drag_start @dragend.stop=drag_end @dragenter.stop=drag_enter @dragover.prevent @dragleave.stop=drag_leave @drop.stop=drop>
      <v-layout class="explorer-directory"
        v-bind:class="['explorer-directory', {'explorer-directory-enabled': enabled && !system}, {'explorer-directory-selected': path == active}]"
        @click.left.stop="system ? null : $emit('input', instance)"
        @click.right.stop="$emit('context', { instance, event: $event })"
      >
          <v-btn tile text x-small @click.stop="system ? null : $emit('toggle')" class="explorer-directory-button mr-1" :color="enabled && !system ? 'black' : 'grey'">
            <v-icon>{{ icon }}</v-icon>
          </v-btn>
          <v-flex>
            <template v-if=system>{{ display }}</template>
            <v-form v-else ref="form" v-model=valid>
              <v-text-field v-show=" ((path == active) && edit)" ref="input" v-model=input dense small autofocus :rules=rules @blur=blur @focus=focus @input="error = null" @keyup.enter=submit />
              <v-text-field v-show="!((path == active) && edit)" ref="input" :value=display disabled dense small />
            </v-form>
          </v-flex>
      </v-layout>
    </div>

    <v-container v-if="expanded" class="explorer-directory-container">
      <div style="height: 2px;" />
      <template v-if=leaf>
        <explorer-file
          v-for="child in children"
          :key=child.uuid
          :uuid=child.uuid
          :ephemeral=child.ephemeral
          :name=child.name
          :path=child.path
          :parent=instance
          :children=child.children
          :directory=child.directory
          :populate=populate
          :format=format
          :active=active
          :edit=edit
          :enabled=enabled
          :expanded=child.expanded
          :title=title

          @input="$emit('input', $event)"
          @context="$emit('context', $event)"
          @open="$emit('open', $event)"
          @edit="$emit('edit', $event)"
          @submit="$emit('submit', $event)"
          @blur="$emit('blur', $event)"
          @paste="$emit('paste', $event)"

          @toggle="child.expanded = !child.expanded"
        />
      </template>
      <template v-else>
        <explorer-file
          v-for="child in children"
          :key=child.uuid
          :uuid=child.uuid
          :ephemeral=child.ephemeral
          :name=child.name
          :path=child.path
          :parent=instance
          :children=child.children
          :directory=child.directory
          :populate=populate
          :format=format
          :active=active
          :edit=edit
          :enabled=enabled
          :expanded=child.expanded
          :title=title

          @input="$emit('input', $event)"
          @context="$emit('context', $event)"
          @open="$emit('open', $event)"
          @edit="$emit('edit', $event)"
          @submit="$emit('submit', $event)"
          @blur="$emit('blur', $event)"
          @paste="$emit('paste', $event)"

          @toggle="child.expanded = !child.expanded"
        />
      </template>
    </v-container>
    <div class="explorer-directory-break" />
  </v-container>

</template>

<style>
.explorer-directory {
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

.explorer-directory-enabled {
  color: black;
}

.explorer-directory-break {
  height: 0px;
  width: 100%;
}

.explorer-directory-drop {
  height: 16px;
  margin: 2px;
}

.explorer-directory-drop.drop {
  outline: 2px dashed #999;
}

.explorer-directory .v-input,
.explorer-directory .v-input input {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 12px;
  color: black;
}

.explorer-directory .v-input__slot {
  margin: 0 !important;
}

.explorer-directory .v-input__slot:before {
  border: none !important;
}

.explorer-directory .v-text-field__details {
  margin-top: 20px;
  position: absolute !important;
  right: 0px;
  z-index: 1000;
}

.explorer-directory .v-input--is-disabled .v-text-field__details {
  display: none !important;
}

.explorer-directory .v-text-field__details .v-messages__wrapper {
  background: rgba(255, 255, 255, 0.8);
}

.explorer-directory-button {
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
  padding: 0 !important;
}

.explorer-directory-container {
  border: solid #C8C8C8;
  border-width: 0 0 0 1px;
  width: auto !important;
  padding: 0 0 0 4px !important;
  margin: 0 0 4px 4px !important;
}

.explorer-directory:hover {
  background: rgba(180, 180, 180, 0.3);
}

.explorer-directory-enabled.explorer-directory:hover {
  background: rgba(150, 150, 150, 0.6);
}

.explorer-directory-selected {
  background: rgba(180, 180, 180, 0.6);
}

.explorer-directory-enabled.explorer-directory-selected {
  background: rgba(244, 40, 30, 0.6);
}

.explorer-directory-selected:hover {
  background: rgba(150, 150, 150, 0.6);
}

.explorer-directory-enabled.explorer-directory-selected:hover {
  background: rgba(255, 20, 10, 0.6);
}

</style>

<script>
import store from '@/store'
import { v4 as uuidv4 } from 'uuid'

export default {
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
    populate: { type: Function },
    format: { type: Function },
    leaf: { type: Boolean },
    parent: { type: Object },
    children: { type: Array }
  },
  data: () => ({
    selected: null,
    directory: true,
    loaded: false,
    valid: false,
    input: '',
    error: null
  }),
  mounted: async function () {
    if (this.expanded) {
      await this.load()
    }

    if (this.ephemeral) {
      this.$emit('input', this.instance)
    }
  },
  watch: {
    expanded: async function (value) {
      if (value) {
        await this.load()
      }
    }
  },
  computed: {
    context: function () {
      return [
        {
          title: 'Expand',
          action: null
        },
        {
          divider: true
        },
        {
          title: 'Open',
          action: (path) => this.$emit('open', { type: 'file', target: path })
        },
        {
          title: 'Open Folder',
          action: (path) => this.$emit('open', { type: 'file', target: path, parent: true })
        },
        {
          title: 'New File',
          action: async () => this.create(false)
        },
        {
          title: 'New Folder',
          action: async () => this.create(true)
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
          action: async (path) => this.$emit('edit')
        },
        {
          title: 'Delete',
          action: async (path) => this.$emit('delete', {
            path,
            reject: async (error) => error,
            resolve: async () => this.parent.remove_item(this)
          })
        }
      ]
    },
    instance: function () {
      return this
    },
    system: function () {
      return [
        '.git'
      ].indexOf(this.name) > -1
    },
    icon: function () {
      if (this.leaf) {
        return this.expanded ? 'mdi-folder-open' : 'mdi-folder'
      }

      return this.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
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

      this.$emit('drag', { context: this })
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
        container.classList.remove('drop')

        if (container.hasAttribute('droppable')) {
          break
        }

        container = container.parentElement
      }
    },
    drop: function (event) {
      this.drag_leave(event)
      this.$emit('drop', { context: this })
    },
    load: async function () {
      if (this.loaded) {
        return
      }

      while (this.children.pop()) { }
      this.loaded = (await this.populate(this)) === true

      this.sort()
    },
    sort: function () {
      this.children.sort((first, second) => {
        const name = (first, second) => {
          return first.path === second.path ? 0 : (first.path < second.path ? -1 : 1)
        }

        if (first.directory && second.directory) {
          return name(first, second)
        } else if (first.directory) {
          return -1
        } else if (second.directory) {
          return 1
        } else {
          return name(first, second)
        }
      })
    },
    focus: function () {
      this.input = this.display
    },
    submit: function () {
      if (this.valid) {
        this.$emit('submit', { context: this })
      }
    },
    blur: function () {
      this.$emit('blur', { context: this })
    },
    update: function (context, update) {
      const child = this.children.find(child => child.path === context.path)

      if (!child) {
        return
      }

      Object.assign(child, update)

      this.sort()
      this.$forceUpdate()
    },
    create: async function (directory, path) {
      if (!this.expanded) {
        this.$emit('toggle')
      }

      this.$emit('edit')

      const data = {
        uuid: uuidv4(),
        ephemeral: true,
        name: '',
        path: '',
        directory
      }

      if (path) {
        const index = this.children.findIndex(child => child.path === path)
        this.children.splice(index, 0, data)
      } else {
        this.children.push(data)
      }
    },
    remove_item: function (source) {
      const index = this.children.findIndex(child => child.uuid === source.uuid)

      if (index < 0) {
        return undefined
      }

      return this.children.splice(index, 1).pop() || false
    },
    insert_item: function (data) {
      data.parent = this.instance

      this.children.push(data)
      this.sort()
    }
  }
}
</script>
