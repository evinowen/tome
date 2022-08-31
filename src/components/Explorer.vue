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
    :relationship=root.relationship
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
    @create=create

    @template=template
    @action=action

    ref="explorer_root"
  />
</template>

<script>
import store from '@/store'
import { shell } from 'electron'
import ExplorerNode, { ExplorerNodeGhostType } from './ExplorerNode.vue'

export default {
  props: {
    value: { type: Object },
    enabled: { type: Boolean }
  },
  data: () => ({
    hold: null
  }),
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
      if (!name) {
        throw new Error('Name provided is falsey')
      }

      if (name.match(/[^a-z0-9.-]/)) {
        throw new Error('Name contains invalid characters')
      }

      const words = String(name).split('.')

      if (words.length && !directory) {
        words.pop()
      }

      return words.map(item => String(item).substring(0, 1).toUpperCase().concat(item.substring(1))).join(' ').trim()
    },
    toggle: async function (state) {
      const { path } = state

      await store.dispatch('files/toggle', { path })
    },
    select: async function (state) {
      const { path } = state

      await store.dispatch('files/select', { path })
    },
    open: async function (state) {
      const { target, parent } = state

      let path = target

      if (parent) {
        path = await window.api.path_dirname(target)
      }

      shell.openPath(path)
    },
    edit: async (state) => await store.dispatch('files/edit', { path: state.target }),
    create: async function (state) {
      const { type, target } = state

      switch (type) {
        case ExplorerNodeGhostType.FILE:
          await store.dispatch('files/ghost', { path: target, directory: false })
          break

        case ExplorerNodeGhostType.DIRECTORY:
          await store.dispatch('files/ghost', { path: target, directory: true })
          break

        case ExplorerNodeGhostType.TEMPLATE:
          await store.dispatch('templates/ghost')
          break

        case ExplorerNodeGhostType.ACTION:
          await store.dispatch('actions/ghost')
          break
      }
    },
    delete: async function (path) {
      await store.dispatch('files/delete', { path })
    },
    submit: async (state) => await store.dispatch('files/submit', state),
    blur: async (state) => await store.dispatch('files/blur', state),
    drag: async function (state) {
      this.hold = state
    },
    drop: async function (state) {
      await store.dispatch('files/move', { path: this.hold.path, proposed: state.path })
    },
    template: async (state) => await store.dispatch('templates/execute', state),
    action: async (state) => await store.dispatch('actions/execute', state)
  },
  components: { ExplorerNode }
}
</script>
