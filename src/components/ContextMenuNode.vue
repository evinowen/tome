<template>
  <div>
  <v-menu
    ref="node"
    v-bind:value="value"
    v-on:input="$emit('input', $event)"
    :position-x="position_x"
    :position-y="position_y"
    dense tile
    content-class="context-menu"
  >
    <v-list dense class="context-menu-list">
      <v-subheader v-if=title>{{ title }}</v-subheader>
      <v-divider></v-divider>
      <v-list-item-group>
        <template v-for="(item, index) in items">
          <div :key="index">
            <v-divider v-if=item.divider></v-divider>
            <v-list-item v-else
              @click="item.action ? $emit('close') && item.action(target) : null"
              @mouseover="expanded = index"
              :disabled="item.active ? !item.active() : false"
            >
              <v-list-item-title class='item'>{{ item.title }}</v-list-item-title>

              <context-menu-node
                v-if="(item.load || item.items) && index === expanded"
                :position_x="local_position_x + 100"
                :position_y="local_position_y + (index * 20) - 10"
                :title=item.title
                :target=target
                :items=item.items
                :value="value"
                v-on="$listeners"
              />
            </v-list-item>
          </div>
        </template>
      </v-list-item-group>
    </v-list>
  </v-menu>
  </div>
</template>

<style scoped>
.v-list-item--link:before {
  background: inherit;
}

.v-list-item:hover,
.v-list-item:hover .item {
  color: var(--v-primary-lighten4) !important;
  background: var(--v-primary-darken2) !important;
}

.context-menu {
  border-radius: 0px !important;
  width: 120px;
}

.context-menu-list {
  border-radius: 0px !important;
  padding: 0px !important;
  min-height: 20px;
}

.context-menu-list .v-subheader {
  height: 18px !important;
  padding: 4px;
}

.context-menu-list .v-list-item {
  min-height: 0px !important;
  padding: 4px 4px 4px 12px;
  font-weight: normal !important;
}
</style>

<script>
import { VList, VListItem, VListItemGroup, VListItemTitle, VSubheader, VDivider, VMenu } from 'vuetify/lib'

export default {
  name: 'ContextMenuNode',
  components: { VList, VListItem, VListItemGroup, VListItemTitle, VSubheader, VDivider, VMenu },
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: null },
    target: { type: String },
    items: { type: Array },
    position_x: { type: Number, default: 0 },
    position_y: { type: Number, default: 0 }
  },
  data: () => ({
    expanded: null,
    local_position_x: 0,
    local_position_y: 0
  }),
  watch: {
    position_x: function (value) {
      this.local_position_x = this.$refs.node.calcXOverflow(value)
    },
    position_y: function (value) {
      this.local_position_y = this.$refs.node.calcYOverflow(value)
    },
    expanded: async function (value) {
      const menu = this.items[value]

      menu.items = menu.load ? await menu.load(this.target) : null
    }
  }
}

</script>
