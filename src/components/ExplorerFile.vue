<template>
  <v-container class="pa-0" style="user-select: none;" v-show="visible">
    <explorer-directory v-if="directory"
      :uuid=uuid
      :ephemeral=ephemeral
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
    <template v-else v-on="$listeners">
      <v-container class="pa-0" style="user-select: none; clear: both;">
        <div class="explorer-file-drop" droppable :draggable="!system" @dragstart.stop=drag_start @dragend.stop=drag_end @dragenter.stop=drag_enter @dragover.prevent @dragleave.stop=drag_leave @drop.stop=drop>
          <v-layout
            v-bind:class="['explorer-file', 'explorer-file-hover', {'explorer-file-enabled': !system}, {'explorer-file-selected': path == active }]"
            @click.left.stop="$emit('input', instance)"
            @click.right.stop="$emit('context', { instance, event: $event })"
          >
            <v-btn tile text x-small @click.stop="system ? null : $emit('input', instance)" class="explorer-file-button mr-1" :color="!system ? 'black' : 'grey'">
              <v-icon>mdi-file</v-icon>
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
      </v-container>

    </template>
    <div class="explorer-file-break" />
  </v-container>

</template>

<style>
.explorer-file {
  height: 20px;
  position: relative;
  top: -2px;
  margin: -2px -2px -4px -2px;
  padding: 0 !important;
  overflow: visible;
  user-select: none;
  vertical-align: text-bottom;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: grey;
}

.explorer-file-enabled {
  color: black;
}

.explorer-file-break {
  height: 2px;
  width: 100%;
}

.explorer-file-drop {
  height: 16px;
  margin: 2px;
}

.explorer-file-drop.drop {
  outline: 2px dashed #999;
}

.explorer-file-button {
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
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
  vertical-align: text-bottom;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.explorer-file .v-input__slot {
  margin: 0 !important;
}

.explorer-file .v-input__slot:before {
  border: none !important;
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
  background: rgba(180, 180, 180, 0.3);
}

.explorer-file-enabled.explorer-file-hover:hover {
  background: rgba(150, 150, 150, 0.6);
}

.explorer-file-selected {
  background: rgba(180, 180, 180, 0.6);
}

.explorer-file-enabled.explorer-file-selected {
  background: rgba(244, 40, 30, 0.6);
}

.explorer-file-selected:hover {
  background: rgba(150, 150, 150, 0.6);
}

.explorer-file-enabled.explorer-file-selected:hover {
  background: rgba(255, 20, 10, 0.6);
}

</style>

<script>
export default {
  props: {
    uuid: { type: String },
    enabled: { type: Boolean },
    ephemeral: { type: Boolean },
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
    input: '',
    error: null
  }),
  mounted: function () {
    if (this.ephemeral) {
      this.$emit('input', this.instance)
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
    display: function () {
      if (this.title && !this.system) {
        return this.format(this.name)
      }

      return this.name
    },
    visible: function () {
      return !(this.title && (this.display === '' || this.system))
    },
    rules: function () {
      if (this.title) {
        return [
          (value) => this.error === null || this.error,
          (value) => String(value).search(/[^\w ]/g) === -1 || 'No special characters are allowed.'
        ]
      }

      return [
        (value) => this.error === null || this.error,
        (value) => String(value).search(/\s/g) === -1 || 'No whitespace is allowed.',
        (value) => String(value).search(/[^\w.]/g) === -1 || 'No special characters are allowed.',
        (value) => String(value).substring(String(value).length - 3) === '.md' || 'Filename must end with .md extension'
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
    create: async function (directory) {
      return this.parent.create(directory, this.path)
    }
  }
}
</script>
