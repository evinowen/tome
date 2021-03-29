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

    @template=template
    @action=action

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
      return store.state.files.selected ? String(store.state.files.selected.uuid) : null
    },
    editing: function () {
      return store.state.files.editing
    },
    root: function () {
      return store.state.files.tree ? store.state.files.tree.base : null
    }
  },
  methods: {
    format: function (name, directory, error) {
      if (name.match(/[^a-z0-9.-]/)) {
        if (error) {
          error()
        }
      }

      const words = name ? String(name).split('.') : ['']

      if (words.length && !directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          if (error) {
            error()
          }

          return name
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
    edit: async (state) => store.dispatch('files/edit', { path: state.target }),
    create: async function (state) {
      const { target, directory } = state

      store.dispatch('files/ghost', { path: target, directory })
    },
    delete: async function (path) {
      store.dispatch('files/delete', { path })
    },
    submit: async (state) => store.dispatch('files/submit', state),
    blur: async (state) => store.dispatch('files/blur'),
    drag: async function (state) {
      this.hold = state
    },
    drop: async function (state) {
      store.dispatch('files/move', { path: this.hold.path, proposed: state.path })
    },
    populate: async (state) => store.dispatch('files/populate', state),
    template: async (state) => store.dispatch('templates/execute', state),
    action: async (state) => store.dispatch('actions/execute', state)
  },
  components: { ExplorerNode }
}
</script>
