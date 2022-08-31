<template>
  <context-menu-node
    v-if=value
    v-resize=resize
    :window_x="window_x"
    :window_y="window_y"
    :position_x="position_x"
    :position_y="position_y"
    :title=title
    :target=target
    :items=items
    :layer=10000
    @close="$emit('input', false)"
    root
    ref="root"
  />
</template>

<script>
import { Resize } from 'vuetify/lib'
import ContextMenuNode from './ContextMenuNode'

export default {
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: null },
    target: { type: String },
    items: { type: Array },
    position_x: { type: Number, default: 0 },
    position_y: { type: Number, default: 0 }
  },
  components: { ContextMenuNode },
  directives: { Resize },
  data: () => ({
    window_x: 0,
    window_y: 0,
    visible: true
  }),
  methods: {
    resize: function () {
      this.window_x = window.innerWidth
      this.window_y = window.innerHeight
    }
  }
}
</script>
