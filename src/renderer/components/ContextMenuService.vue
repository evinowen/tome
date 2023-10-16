<template>
  <context-menu-node
    v-if="context.visible"
    ref="root"
    v-resize="resize"
    :window_x="window_x"
    :window_y="window_y"
    :position_x="context.position.x"
    :position_y="context.position.y"
    :title="context.title"
    :target="context.target"
    :items="context.items"
    :layer="10000"
    root
    @close="close"
  />
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import { Resize } from 'vuetify/directives'
import ContextMenuNode from './ContextMenuNode.vue'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { ContextMenuNode },
  directives: { Resize }
})
class ContextMenuService extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  window_x = 0
  window_y = 0
  visible = true

  get context () {
    return this.store.state.context
  }

  resize () {
    this.window_x = window.innerWidth
    this.window_y = window.innerHeight
  }

  async close () {
    await this.store.dispatch('context/close')
  }
}

export default toNative(ContextMenuService)
</script>
