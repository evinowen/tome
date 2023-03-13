<template>
  <div class="explorer-root">
    <explorer-node
      v-if="root.path !== ''"
      ref="explorer_root"
      root
      :uuid="root.uuid"
      :active="active"
      :edit="editing"
      :enabled="enabled"
      :title="configuration.format_titles"
      :format="format"
      @context="$emit('context', $event)"
      @select="select"
      @paste="$emit('paste', $event)"
      @toggle="toggle"
      @open="open"
      @edit="edit"
      @submit="submit"
      @blur="blur"
      @drag="drag"
      @drop="drop"
      @create="create"
      @template="template"
      @action="action"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store'
import ExplorerNode, { ExplorerNodeGhostType } from './ExplorerNode.vue'
import File from '@/store/modules/files/file'

export const ExplorerProperties = Vue.extend({
  props: {
    value: { type: Object, default: () => ({}) },
    enabled: { type: Boolean, default: false }
  }
})

@Component({
  components: { ExplorerNode }
})
export default class Explorer extends ExplorerProperties {
  hold?: { path: string }

  get repository () {
    return store.state.repository
  }

  get configuration () {
    return store.state.configuration
  }

  get active () {
    if (store.state.files.active === '') {
      return ''
    }

    const selected = store.state.files.directory[store.state.files.active]

    if (selected) {
      return selected.uuid
    }

    return ''
  }

  get editing () {
    return store.state.files.editing
  }

  get root (): File {
    return store.state.files.directory[store.state.files.base] || File.Empty
  }

  format (name, directory = false) {
    if (!name) {
      throw new Error('Name provided is falsey')
    }

    if (/[^\d.a-z-]/.test(name)) {
      throw new Error('Name contains invalid characters')
    }

    const words = String(name).split('.')

    if (words.length > 0 && !directory) {
      words.pop()
    }

    return words.map(item => `${String(item).slice(0, 1).toUpperCase()}${item.slice(1)}`).join(' ').trim()
  }

  async toggle (state) {
    const { path } = state

    await store.dispatch('files/toggle', { path })
  }

  async select (state) {
    const { path } = state
    await store.dispatch('files/select', { path })
  }

  async open (state) {
    const { target, container = false } = state

    await store.dispatch('files/open', { path: target, container })
  }

  async edit (state) {
    await store.dispatch('files/edit', { path: state.target })
  }

  async create (state) {
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
  }

  async delete (path) {
    await store.dispatch('files/delete', { path })
  }

  async submit (state) { await store.dispatch('files/submit', state) }
  async blur () { await store.dispatch('files/blur') }
  async drag (state) {
    this.hold = state
  }

  async drop (state) {
    await store.dispatch('files/move', { path: this.hold.path, proposed: state.path })
  }

  async template (state) { await store.dispatch('templates/execute', state) }
  async action (state) { await store.dispatch('actions/execute', state) }
}
</script>

<style>
.explorer-root {
  border-left:4px solid rgba(128, 128, 128, 0.1);
  height: 100%;
}
</style>
