<template>
  <v-container class="pa-0" style="user-select: none;">
    <v-container class="explorer-folder"
      v-bind:class="['explorer-folder', {'explorer-folder-enabled': enabled}, {'explorer-folder-selected': path == (leaf ? active : upstream)}]"
      @click.left.stop="select(null)"
      @click.right.stop="$emit('context', $event, 'folder', path)"
    >
        <v-btn tile text x-small @click.stop="toggle" class="explorer-folder-button mr-1">
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <div style="display: inline-block;">{{ name }}</div>
    </v-container>

    <v-container v-if="expanded" class="explorer-folder-container">
      <template v-if=leaf>
        <explorer-node
          v-for="child in children"
          v-on:selected="select"
          v-on="$listeners"
          :key=child.path
          :name=child.name
          :path=child.path
          :parent=this
          :directory=child.directory
          :populate=populate
          :active=active
          :enabled=enabled
        />
      </template>
      <template v-else>
        <explorer-node
          v-for="child in children"
          v-on:selected="select"
          v-on="$listeners"
          :key=child.path
          :name=child.name
          :path=child.path
          :parent=this
          :directory=child.directory
          :populate=populate
          :active=upstream
          :enabled=enabled
        />
      </template>
    </v-container>

  </v-container>
</template>

<style>
.explorer-folder {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  padding: 0 !important;
  vertical-align: text-bottom;
}

.explorer-folder-enabled.explorer-folder:hover {
  background: #BBBBBB;
}

.explorer-folder-button {
  min-width: 20px !important;
  padding: 0 !important;
}

.explorer-folder-enabled.explorer-folder-selected {
  background: #F44336;
}

.explorer-folder-enabled.explorer-folder-selected:hover {
  background: #F66055;
}

.explorer-folder-container {
  border: solid #C8C8C8;
  border-width: 0 0 0 1px;
  width: auto !important;
  padding: 0 0 0 4px !important;
  margin: 0 0 4px 4px !important;
}

</style>

<script>
export default {
  props: {
    enabled: { type: Boolean },
    name: { type: String, default: '' },
    path: { type: String },
    active: { type: String },
    populate: { type: Function },
    leaf: { type: Boolean }
  },
  data: () => ({
    selected: null,
    directory: true,
    expanded: false,
    loaded: false,
    children: [],
    upstream: ''
  }),
  mounted: function () {
    if (!this.leaf) {
      this.toggle()
    }
  },
  computed: {
    icon: function () {
      if (this.leaf) {
        return this.expanded ? 'mdi-folder-open' : 'mdi-folder'
      }

      return this.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
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
    select: function (node) {
      if (!this.enabled) {
        return
      }

      this.selected = node || this
      this.upstream = this.selected.path
      return this.$emit('selected', this.selected)
    }
  }
}
</script>
