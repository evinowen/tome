<template>
  <div>
  <v-menu
    v-bind:value="value"
    v-on:input="$emit('input', $event)"
    :position-x="position_x"
    :position-y="position_y"
    dark dense tile
    content-class="context-menu"
  >
    <v-list dense class="context-menu-list">
      <v-subheader v-if=title>{{ title }}</v-subheader>
      <v-divider></v-divider>
      <v-list-item-group>
        <template v-for="(item, index) in items">
          <div :key="index">
            <v-divider v-if=item.divider></v-divider>
            <v-list-item
              @click="item.action ? item.action(target) : null"
              @mouseover="expanded = index"
              :disabled="item.active ? !item.active() : false"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>

              <context-menu-node
                v-if="(item.load || item.items) && index === expanded"
                :position_x="position_x + 121"
                :position_y="position_y + (index * 20)"
                :title=item.title
                :target=target
                :items=item.items
                :value="value"
              />
            </v-list-item>
          </div>
        </template>
      </v-list-item-group>
    </v-list>
  </v-menu>
  </div>
</template>

<style>
.context-menu {
  border-radius: 0px !important;
  width: 120px;
}

.context-menu-list {
  border-radius: 0px !important;
  padding: 0px !important;
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
export default {
  name: 'ContextMenuNode',
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: null },
    target: { type: String },
    items: { type: Array },
    position_x: { type: Number, default: 0 },
    position_y: { type: Number, default: 0 }
  },
  data: () => ({
    expanded: null
  }),
  watch: {
    expanded: async function (value) {
      if (this.expanded === -1) {
        return
      }

      const menu = this.items[this.expanded]

      if (!menu.load) {
        return
      }

      menu.items = await menu.load(this.target)
    }
  }
}

</script>
