<template>
  <explorer-node v-if=root
    root
    :name=tome.name
    :path=tome.path
    :active=active
    :edit=editing
    :enabled=enabled
    :title=configuration.format_titles
    :format=format
    :hold=hold
    :children=root.children
    :expanded=root.expanded

    @context="$emit('context', $event)"
    @select=select
    @paste="$emit('paste', $event)"

    @toggle=toggle
    @open=open
    @edit=edit
    @submit=submit
    @blur=blur
    @drag=drag
    @drop=drop
    @populate=populate
    @create=create

    ref="explorer_root"
  />
</template>

<script>
import store from '@/store'
import { remote, shell } from 'electron'
import ExplorerNode from './ExplorerNode.vue'

export default {
  props: {
    value: { type: Object },
    enabled: { type: Boolean }
  },
  data: () => ({
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
      return store.state.files.active
    },
    root: function () {
      return store.state.files.tree
    }
  },
  methods: {
    format: function (name, directory) {
      const words = name ? String(name).split('.') : ['']

      if (words.length && !directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          return ' - '
        }
      }

      return words.map(item => String(item).substring(0, 1).toUpperCase().concat(item.substring(1))).join(' ').trim()
    },
    toggle: async function (state) {
      const { path } = state

      store.dispatch('files/toggle', { path })
    },
    select: async function (state) {
      const { path } = state

      store.dispatch('files/select', { path })
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
    create: async function (state) {
      const { target, directory } = state

      store.dispatch('files/ghost', { path: target, directory })
    },
    delete: async function (path) {
      store.dispatch('files/delete', { path })
    },
    submit: async (state) => store.dispatch('files/submit', state),
    blur: async function (state) {
      this.editing = false
    },
    drag: async function (state) {
      this.hold = state
    },
    drop: async function (state) {
      store.dispatch('files/move', { path: this.hold.path, proposed: state.path })
    },
    populate: async function (state) {
      const { path } = state

      return store.dispatch('files/populate', { path })
    }
  },
  components: { ExplorerNode }
}
</script>
