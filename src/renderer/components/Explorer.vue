<template>
  <div class="root">
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

      @action="action"
      @blur="blur"
      @context="$emit('context', $event)"
      @create="create"
      @delete="delete_event"
      @drag="drag"
      @drop="drop"
      @edit="edit"
      @open="open"
      @paste="$emit('paste', $event)"
      @select="select"
      @submit="submit"
      @template="template"
      @toggle="toggle"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import ExplorerNode, { ExplorerNodeGhostType } from './ExplorerNode.vue'
import File from '@/store/modules/files/file'

@Component({
  components: { ExplorerNode }
})
class Explorer extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: () => ({}) })
  value: any

  @Prop({ default: false })
  enabled: boolean

  hold?: { path: string }

  get repository () {
    return this.store.state.repository
  }

  get configuration () {
    return this.store.state.configuration
  }

  get active () {
    if (this.store.state.files.active === '') {
      return ''
    }

    const selected = this.store.state.files.directory[this.store.state.files.active]

    if (selected) {
      return selected.uuid
    }

    return ''
  }

  get editing () {
    return this.store.state.files.editing
  }

  get root (): File {
    return this.store.state.files.directory[this.store.state.files.base] || File.Empty
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

    await this.store.dispatch('files/toggle', { path })
  }

  async select (state) {
    const { path } = state
    await this.store.dispatch('files/select', { path })
  }

  async open (state) {
    const { target, container = false } = state

    await this.store.dispatch('files/open', { path: target, container })
  }

  async edit (state) {
    await this.store.dispatch('files/edit', { path: state.target })
  }

  async create (state) {
    const { type, target } = state

    switch (type) {
      case ExplorerNodeGhostType.FILE:
        await this.store.dispatch('files/ghost', { path: target, directory: false })
        break

      case ExplorerNodeGhostType.DIRECTORY:
        await this.store.dispatch('files/ghost', { path: target, directory: true })
        break

      case ExplorerNodeGhostType.TEMPLATE:
        await this.store.dispatch('templates/ghost')
        break

      case ExplorerNodeGhostType.ACTION:
        await this.store.dispatch('actions/ghost')
        break
    }
  }

  async delete_event (state) {
    const { target } = state
    await this.store.dispatch('files/delete', { path: target })
  }

  async submit (state) { await this.store.dispatch('files/submit', state) }
  async blur () { await this.store.dispatch('files/blur') }
  async drag (state) {
    this.hold = state
  }

  async drop (state) {
    await this.store.dispatch('files/move', { path: this.hold.path, proposed: state.path })
  }

  async template (state) { await this.store.dispatch('templates/execute', state) }
  async action (state) { await this.store.dispatch('actions/execute', state) }
}

export default toNative(Explorer)
</script>

<style scoped>
.root {
  height: 100%;
  user-select: none;
}
</style>
