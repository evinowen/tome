<template>
  <v-menu
    ref="node"
    :value=value
    :position-x=position_x
    :position-y=position_y
    :close-on-content-click="false"
    dense tile content-class="context-menu"
    @input="$emit('input', $event)"
    @mouseover="$emit('mouseover', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <v-list dense class="context-menu-list">
      <v-subheader v-if=title>{{ title }}</v-subheader>
      <v-divider></v-divider>
      <v-list-item-group>
        <div v-for="(item, index) in items" :key="index">
          <v-divider v-if=item.divider></v-divider>
          <v-list-item v-else
            @click.stop="execute(item.action)"
            @mouseover="promote((item.items || item.load) ? index : -1)"
            :disabled="item.active ? !item.active() : false"
            :inactive="item.action ? false : true"
          >
            <v-list-item-title class='item'>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
          <context-menu-node
            :value="(item.items || item.load) && ((promoted === index) || (active === index))"
            :position_x="local_position_x + 100"
            :position_y="local_position_y + (index * 20) - 10"
            :title=item.title
            :target=target
            :items=item.items
            @mouseover="activate(index)"
            @mouseleave="deactivate(index)"
            @close="$emit('close')"
          />
        </div>
      </v-list-item-group>
    </v-list>
  </v-menu>
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
    active: -1,
    promoted: -1,
    local_position_x: 0,
    local_position_y: 0
  }),
  watch: {
    position_x: function (value) {
      this.local_position_x = this.$refs.node.calcXOverflow(value)
    },
    position_y: function (value) {
      this.local_position_y = this.$refs.node.calcYOverflow(value)
    }
  },
  methods: {
    activate: function (index) {
      this.promote(index)
      this.active = index
    },
    deactivate: function (index) {
      if (this.active !== index) {
        return
      }

      this.active = -1
    },
    promote: async function (index) {
      if (this.promoted === index) {
        return
      }

      this.active = -1
      this.promoted = -1

      if (!this.items) {
        return
      }

      if (index < 0) {
        return
      }

      const item = this.items[index]

      if (!item.items && item.load) {
        item.items = await item.load()
      }

      this.promoted = index
    },
    execute: async function (action = null) {
      if (action === null) {
        return
      }

      this.$emit('close')
      await action(this.target)
    }
  }
}
</script>
