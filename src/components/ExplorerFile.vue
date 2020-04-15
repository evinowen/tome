<template>
  <v-container class="pa-0" style="user-select: none;">
    <template v-if="directory">
      <v-container v-if="disabled" class="explorer-file explorer-file-disabled">
        <div class="explorer-file">
          <v-icon class="mr-1">mdi-folder</v-icon>
          {{ name }}
        </div>
      </v-container>
      <explorer-directory
        v-else
        :name=name
        :path=path
        :populate=populate
        :format=format
        :enabled=enabled
        :title=title
        :active=active
        :edit=edit
        child
        v-on="$listeners"
        leaf
      />
    </template>

    <template v-else v-on="$listeners">
      <v-container
        v-bind:class="['explorer-file', 'explorer-file-hover', {'explorer-file-enabled': enabled}, {'explorer-file-selected': path == active }]"
        @click.left.stop="$emit('input', { path })"
        @click.right="$emit('context', $event, 'file', path)"
      >
        <v-layout class="explorer-file">
          <v-btn tile text x-small @click.stop="$emit('input', { path })" class="explorer-file-button mr-1">
            <v-icon>mdi-file</v-icon>
          </v-btn>
          <v-flex>
            <v-text-field v-show=" ((path == active) && edit)" ref="input" v-model=input dense small hide-details autofocus @blur=blur @focus=focus @keyup.enter=submit />
            <v-text-field v-show="!((path == active) && edit)" ref="input" :value=display disabled dense small hide-details />
          </v-flex>
        </v-layout>
      </v-container>

    </template>
  </v-container>

</template>

<style>
.explorer-file {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  padding: 0 !important;
  vertical-align: text-bottom;
}

.explorer-file-button {
  min-width: 20px !important;
  padding: 0 !important;
}

.explorer-file-disabled,
.explorer-file-disabled .v-icon {
  color: rgba(0, 0, 0, 0.20);
}

.explorer-file .v-input,
.explorer-file .v-input input {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 12px;
  color: black;
}

.explorer-file-hover:hover {
  background: #EEEEEE;
}

.explorer-file-enabled.explorer-file-hover:hover {
  background: #BBBBBB;
}

.explorer-file-selected {
  background: #CCCCCC;
}

.explorer-file-enabled.explorer-file-selected {
  background: #F44336;
}

.explorer-file-selected:hover {
  background: #BBBBBB;
}

.explorer-file-enabled.explorer-file-selected:hover {
  background: #F66055;
}

</style>

<script>
export default {
  props: {
    enabled: { type: Boolean },
    title: { type: Boolean },
    name: { type: String, default: '' },
    path: { type: String, default: '' },
    active: { type: String },
    edit: { type: Boolean },
    populate: { type: Function },
    format: { type: Function },
    highlight: { type: String, default: '' },
    directory: { type: Boolean, default: false },
    parent: { type: Object }
  },
  data: () => ({
    expanded: false,
    loaded: false,
    children: [],
    input: ''
  }),
  computed: {
    disabled: function () {
      return [
        '.git'
      ].indexOf(this.name) > -1
    },
    display: function () {
      if (this.title) {
        return this.format(this.name)
      }

      return this.name
    }
  },
  methods: {
    focus: function () {
      this.input = this.display
    },
    submit: function () {
      this.$emit('submit', {
        title: this.title,
        directory: this.directory,
        original: this.display,
        proposed: this.input,
        path: this.path
      })
    },
    blur: function () {
      this.$emit('blur')
    }
  }
}
</script>
