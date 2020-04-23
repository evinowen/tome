<template>
  <v-container class="pa-0" style="user-select: none; clear: both;" v-show="visible">
    <div v-if=!leaf style="height: 2px;" />
    <div class="explorer-directory-drop" droppable :draggable="leaf && !system" @dragstart.stop=drag_start @dragend.stop=drag_end @dragenter.stop=drag_enter @dragover.prevent @dragleave.stop=drag_leave @drop.stop=drop>
      <v-layout class="explorer-directory"
        v-bind:class="['explorer-directory', {'explorer-directory-enabled': enabled && !system}, {'explorer-directory-selected': path == active}]"
        @click.left.stop="system ? null : $emit('input', instance)"
        @click.right.stop="$emit('context', $event, 'folder', path)"
      >
          <v-btn tile text x-small @click.stop="system ? null : toggle()" class="explorer-directory-button mr-1" :color="enabled && !system ? 'black' : 'grey'">
            <v-icon>{{ icon }}</v-icon>
          </v-btn>
          <v-flex>
            <template v-if=system>{{ display }}</template>
            <v-form v-else v-model=valid>
              <v-text-field v-show=" ((path == active) && edit)" ref="input" v-model=input dense small autofocus :rules=rules @blur=blur @focus=focus @keyup.enter=submit />
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
          v-on="$listeners"
          :key=child.uuid
          :uuid=child.uuid
          :name=child.name
          :path=child.path
          :parent=instance
          :directory=child.directory
          :populate=populate
          :format=format
          :active=active
          :edit=edit
          :enabled=enabled
          :title=title
        />
      </template>
      <template v-else>
        <explorer-file
          v-for="child in children"
          v-on="$listeners"
          :key=child.uuid
          :uuid=child.uuid
          :name=child.name
          :path=child.path
          :parent=instance
          :directory=child.directory
          :populate=populate
          :format=format
          :active=active
          :edit=edit
          :enabled=enabled
          :title=title
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
export default {
  props: {
    uuid: { type: String },
    enabled: { type: Boolean },
    title: { type: Boolean },
    name: { type: String, default: '' },
    path: { type: String },
    active: { type: String },
    edit: { type: Boolean },
    populate: { type: Function },
    format: { type: Function },
    leaf: { type: Boolean },
    parent: { type: Object }
  },
  data: () => ({
    selected: null,
    directory: true,
    expanded: false,
    loaded: false,
    children: [],
    valid: false,
    input: ''
  }),
  mounted: function () {
    if (!this.leaf) {
      this.toggle()
    }
  },
  computed: {
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
          (value) => String(value).search(/[^\w ]/g) === -1 || 'No special characters are allowed.'
        ]
      }

      return [
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
    toggle: async function () {
      if (this.system || this.expanded) {
        this.$emit('collapsing', this)
        this.expanded = false
        this.$emit('collapsed', this)
      } else {
        this.$emit('expanding', this)

        if (!this.loaded && this.populate) {
          await this.load()
        }

        this.loaded = false

        this.expanded = true
        this.$emit('expanded', this)
      }
    },
    load: async function () {
      this.loaded = false

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
        this.$emit('submit', {
          container: this.parent,
          title: this.title,
          directory: true,
          original: this.display,
          proposed: this.input,
          path: this.path
        })
      }
    },
    blur: function () {
      this.$emit('blur')
    },
    update: function (path, update) {
      console.log('update... ', path)
      this.children.forEach((child, index) => {
        if (child.path === path) {
          console.log('found!', this.children[index])
          this.children[index] = { ...child, ...update }
          console.log('updated!', this.children[index])
        }
      })
      this.sort()
      this.$forceUpdate()
    },
    remove_item: function (source) {
      console.log('remove_item source path', source.path)
      console.log('remove_item parent path', this.path)

      const index = this.children.findIndex(child => child.uuid === source.uuid)

      if (index < 0) {
        return undefined
      }

      return this.children.splice(index, 1).pop() || false
    },
    insert_item: function (data) {
      console.log('insert_item data', data)
      console.log('insert_item destination path', this.path)

      data.parent = this.instance

      this.children.push(data)
      this.sort()
    }
  }
}
</script>
