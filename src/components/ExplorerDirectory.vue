<template>
  <v-container class="pa-0" style="user-select: none;">
    <v-layout class="explorer-directory"
      v-bind:class="['explorer-directory', {'explorer-directory-enabled': enabled}, {'explorer-directory-selected': path == active}]"
      @click.left.stop="$emit('input', instance)"
      @click.right.stop="$emit('context', $event, 'folder', path)"
    >
        <v-btn tile text x-small @click.stop="toggle" class="explorer-directory-button mr-1">
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <v-flex>
          <v-form v-model=valid>
            <v-text-field v-show=" ((path == active) && edit)" ref="input" v-model=input dense small autofocus :rules=rules @blur=blur @focus=focus @keyup.enter=submit />
            <v-text-field v-show="!((path == active) && edit)" ref="input" :value=display disabled dense small />
          </v-form>
        </v-flex>
    </v-layout>

    <v-container v-if="expanded" class="explorer-directory-container">
      <template v-if=leaf>
        <explorer-file
          v-for="child in children"
          v-on="$listeners"
          :key=child.uuid
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

  </v-container>
</template>

<style>
.explorer-directory {
  height: 20px;
  padding: 0 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  vertical-align: text-bottom;
}

.explorer-directory .v-input,
.explorer-directory .v-input input {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 12px;
  color: black;
}

.explorer-directory .v-text-field__details {
  margin-top: 20px;
  position: absolute !important;
  right: 0px;
  z-index: 1000;
}

.explorer-directory .v-text-field__details .v-messages__wrapper {
  background: rgba(255, 255, 255, 0.8);
}

.explorer-directory-button {
  min-width: 20px !important;
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
  background: #EEEEEE;
}

.explorer-directory-enabled.explorer-directory:hover {
  background: #BBBBBB;
}

.explorer-directory-selected {
  background: #CCCCCC;
}

.explorer-directory-enabled.explorer-directory-selected {
  background: #F44336;
}

.explorer-directory-selected:hover {
  background: #BBBBBB;
}

.explorer-directory-enabled.explorer-directory-selected:hover {
  background: #F66055;
}

</style>

<script>
export default {
  props: {
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
    icon: function () {
      if (this.leaf) {
        return this.expanded ? 'mdi-folder-open' : 'mdi-folder'
      }

      return this.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
    },
    display: function () {
      if (this.title) {
        return this.format(this.name, true)
      }

      return this.name
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
    toggle: async function () {
      if (this.expanded) {
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
      this.$forceUpdate()
    }
  }
}
</script>
