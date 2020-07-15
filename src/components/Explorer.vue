<template>
  <explorer-directory
    :name=tome.name
    :path=tome.path
    :active=active
    :edit=editing
    :enabled=enabled
    :title=configuration.format_titles
    :populate=populate
    :format=format
    :hold=hold
    :children=children
    :expanded=true
    @context="$emit('context', $event)"
    @input="$emit('input', $event)"
    @paste="$emit('paste', $event)"

    @open=open
    @edit=edit
    @submit=submit
    @blur=blur
    @drag=drag
    @drop=drop

    ref="explorer_root"
  />
</template>

<script>
import store from '@/store'
import { remote, shell } from 'electron'
import ExplorerDirectory from './ExplorerDirectory.vue'

export default {
  props: {
    value: { type: Object },
    enabled: { type: Boolean },
    populate: { type: Function }
  },
  data: () => ({
    children: [],
    editing: false,
    hold: null
  }),
  mounted: async function () {
    const fs = remote.require('fs')
    const path = remote.require('path')

    this.remote = { fs, path }
  },
  computed: {
    tome: function () {
      return store.state.tome
    },
    configuration: function () {
      return store.state.configuration
    },
    active: function () {
      return this.value ? this.value.path : ''
    }
  },
  methods: {
    format: function (name, directory) {
      const words = name.split('.')

      if (name.length && !directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          return ' - '
        }
      }

      return words.map(item => String(item).substring(0, 1).toUpperCase().concat(item.substring(1))).join(' ').trim()
    },
    open: async function (state) {
      const { target, parent } = state

      let path = target

      if (parent) {
        path = this.remote.path.dirname(target)
      }

      shell.openItem(path)
    },
    edit: async function () {
      this.editing = true
    },
    create: async function (path, directory) {
      await this.value.create(path, directory)
      this.editing = true
    },
    delete: async function (path) {
      this.$emit('delete', {
        path,
        reject: async (error) => error,
        resolve: async () => this.value.parent.remove_item(this.value)
      })
    },
    submit: async function (state) {
      const { context } = state

      let input = context.input

      if (context.title) {
        input = input.toLowerCase().replace(/ +/g, '.')

        if (!context.directory) {
          input = input.concat('.md')
        }
      }

      const resolve = async (update) => {
        context.parent.update(context, update)
        await this.blur({ context: this })
      }

      const reject = async (message) => {
        context.error = message
        context.$refs.form.validate()
      }

      if (context.ephemeral) {
        this.$emit('create', { context, input, resolve, reject })
      } else {
        this.$emit('rename', context.path, input, resolve)
      }
    },
    blur: async function (state) {
      const { context } = state

      if (context.ephemeral) {
        context.parent.remove_item(context)
      }

      this.editing = false
    },
    drag: async function (state) {
      this.hold = state
    },
    drop: async function (state) {
      if (state.context.directory && !state.context.expanded) {
        await state.context.$emit('toggle')
      }

      this.$emit('move', this.hold.context.path, state.context.path, {
        reject: async (error) => error,
        resolve: async (path) => {
          const data = this.hold.context.parent.remove_item(this.hold.context)

          data.path = path || data.path

          if (state.context.directory) {
            state.context.insert_item(data)
          } else {
            state.context.parent.insert_item(data)
          }

          this.hold = null
        }
      })
    }
  },
  components: {
    ExplorerDirectory
  }
}
</script>
