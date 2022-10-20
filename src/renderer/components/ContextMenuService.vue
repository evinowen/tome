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
import Vue from 'vue'
import Component from 'vue-class-component'
import { Resize } from 'vuetify/lib'
import ContextMenuNode from './ContextMenuNode.vue'
import store from '@/store'

export const ContextMenuServiceProperties = Vue.extend({})

@Component({
  components: { ContextMenuNode },
  directives: { Resize }
})
export default class ContextMenuService extends ContextMenuServiceProperties {
  window_x = 0
  window_y = 0
  visible = true

  get context () {
    return store.state.context
  }

  resize () {
    this.window_x = window.innerWidth
    this.window_y = window.innerHeight
  }

  async close () {
    await store.dispatch('context/close')
  }
}
</script>
