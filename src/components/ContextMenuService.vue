<template>
  <context-menu-node
    :position_x="position_x"
    :position_y="position_y"
    :title=title
    :target=target
    :items=items
    :value="value"
    v-on="$listeners"
    ref="root"
  />
</template>

<script>
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
  components: {
    ContextMenuNode
  }
}
</script>
