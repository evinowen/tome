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
        :parent=parent
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
        @click.left.stop="$emit('input', instance)"
        @click.right="$emit('context', $event, 'file', path)"
      >
        <div draggable @dragstart.stop=drag>
          <v-layout class="explorer-file">
            <v-btn tile text x-small @click.stop="$emit('input', instance)" class="explorer-file-button mr-1">
              <v-icon>mdi-file</v-icon>
            </v-btn>
            <v-flex>
              <v-form v-model=valid>
                <v-text-field v-show=" ((path == active) && edit)" ref="input" v-model=input dense small autofocus :rules=rules @blur=blur @focus=focus @keyup.enter=submit />
                <v-text-field v-show="!((path == active) && edit)" ref="input" :value=display disabled dense small />
              </v-form>
            </v-flex>
          </v-layout>
        </div>
      </v-container>

    </template>
  </v-container>

</template>

<style>
.explorer-file {
  height: 20px;
  padding: 0 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
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

.explorer-file .v-input__slot {
  margin: 0 !important;
}

.explorer-file .v-text-field__details {
  margin-top: 20px;
  position: absolute !important;
  right: 0px;
  z-index: 1000;
}

.explorer-file .v-input--is-disabled .v-text-field__details {
  display: none !important;
}

.explorer-file .v-text-field__details .v-messages__wrapper {
  background: rgba(255, 255, 255, 0.8);
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
    valid: false,
    input: ''
  }),
  computed: {
    instance: function () {
      return this
    },
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
    },
    rules: function () {
      if (this.title) {
        return [
          (value) => String(value).search(/[^\w ]/g) === -1 || 'No special characters are allowed.'
        ]
      }

      return [
        (value) => String(value).search(/\s/g) === -1 || 'No whitespace is allowed.',
        (value) => String(value).search(/[^\w.]/g) === -1 || 'No special characters are allowed.',
        (value) => String(value).substring(String(value).length - 3) === '.md' || 'Filename must end with .md extension'
      ]
    }
  },
  methods: {
    drag: function () {
      event.dataTransfer.dropEffect = 'move'
    },
    focus: function () {
      this.input = this.display
    },
    submit: function () {
      if (this.valid) {
        this.$emit('submit', {
          container: this.parent,
          title: this.title,
          directory: this.directory,
          original: this.display,
          proposed: this.input,
          path: this.path
        })
      }
    },
    blur: function () {
      this.$emit('blur')
    }
  }
}
</script>
