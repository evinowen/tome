<template>
  <context-menu-node
    v-if=context.visible
    v-resize=resize
    :window_x=window_x
    :window_y=window_y
    :position_x=context.position.x
    :position_y=context.position.y
    :title=context.title
    :target=context.target
    :items=context.items
    :layer=10000
    @close=close
    root
    ref="root"
  />
</template>

<script>
import { Resize } from 'vuetify/lib'
import ContextMenuNode from './ContextMenuNode'
import store from '@/store'

export default {
  components: { ContextMenuNode },
  directives: { Resize },
  data: () => ({
    window_x: 0,
    window_y: 0,
    visible: true
  }),
  computed: {
    context: function () {
      return store.state.context
    }
  },
  methods: {
    resize: function () {
      this.window_x = window.innerWidth
      this.window_y = window.innerHeight
    },
    close: async function () {
      await store.dispatch('context/close')
    }
  }
}
</script>
