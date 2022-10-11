<template>
  <div ref="node" v-click-outside="{ handler: () => $emit('close'), closeConditional: () => root, include }" class="context-menu">
    <v-list dense class="context-menu-list">
      <v-subheader>{{ title || '&nbsp;' }}</v-subheader>
      <v-divider />
      <v-list-item-group>
        <div v-for="(item, index) in items" :key="index">
          <v-divider v-if=item.divider />
          <v-list-item
            v-else
            :disabled="item.active ? !item.active() : false"
            :inactive="item.action ? false : true"
            @click.stop="execute(item.action)"
            @mouseover="promote(index)"
          >
            <v-list-item-title class='item' style="line-height: 16px !important;">
              <v-layout>
                <v-flex shrink class="menu-arrow">
                  <v-icon v-show="local_flip_x && (item.items || item.load)" small>
                    {{ local_flip_x && (item.items || item.load) ? "mdi-menu-left" : "" }}
                  </v-icon>
                </v-flex>
                <v-flex grow>
                  {{ item.title }}
                </v-flex>
                <v-flex shrink class="menu-arrow">
                  <v-icon v-show="!local_flip_x && (item.items || item.load)" small>
                    {{ !local_flip_x && (item.items || item.load) ? "mdi-menu-right" : "" }}
                  </v-icon>
                </v-flex>
              </v-layout>
            </v-list-item-title>
          </v-list-item>
          <context-menu-node
            v-if="item.items || item.load"
            v-show="(index > -1) && (((promoted === index) || (active === index)))"
            :window_x="window_x"
            :window_y="window_y"
            :position_x="local_position_x + (width * (local_flip_x ? 0 : 1))"
            :position_y="local_position_y + offset(index) + (20 * (local_flip_y ? 1 : -1))"
            :flip_x="local_flip_x"
            :flip_y="local_flip_y"
            :title=item.title
            :target=target
            :items=item.items
            :layer="layer + 1"
            @mouseover="activate(index)"
            @mouseleave="deactivate(index)"
            @close="$emit('close')"
          />
        </div>
      </v-list-item-group>
    </v-list>
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
  position: fixed;
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
  padding: 1px;
  font-weight: normal !important;
}

.menu-arrow {
  width: 14px;
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VLayout, VFlex, VList, VListItem, VListItemGroup, VListItemTitle, VSubheader, VIcon, VDivider, ClickOutside } from 'vuetify/lib'
import ResizeObserver from 'resize-observer-polyfill'

export default Vue.extend({
  name: 'ContextMenuNode',
  components: { VLayout, VFlex, VList, VListItem, VListItemGroup, VListItemTitle, VSubheader, VIcon, VDivider },
  directives: { ClickOutside },
  props: {
    title: { type: String, default: null },
    root: { type: Boolean, default: false },
    target: { type: String, default: null },
    items: { type: Array, default: () => [] },
    position_x: { type: Number, default: 0 },
    position_y: { type: Number, default: 0 },
    flip_x: { type: Boolean, default: null },
    flip_y: { type: Boolean, default: null },
    window_x: { type: Number, default: 0 },
    window_y: { type: Number, default: 0 },
    layer: { type: Number, default: 0 }
  },
  data: () => ({
    active: -1,
    promoted: -1,
    width: 0,
    height: 0,
    local_position_x: 0,
    local_position_y: 0,
    local_flip_x: false,
    local_flip_y: false,
    resize_observer: null
  }),
  mounted: function () {
    this.resize_observer = new ResizeObserver(this.resize)
    this.resize_observer.observe(this.$refs.node)
  },
  watch: {
    position_x: function () {
      this.reposition()
    },
    position_y: function () {
      this.reposition()
    },
    flip_x: function () {
      this.reposition()
    },
    flip_y: function () {
      this.reposition()
    }
  },
  methods: {
    include: function () {
      const result = [...this.$refs.node.querySelectorAll('*,* > *')]
      return result
    },
    resize: function () {
      if (this.$refs.node) {
        this.width = this.$refs.node.clientWidth
        this.height = this.$refs.node.clientHeight
      }

      this.reposition()
    },
    offset: function (target) {
      let height = 19

      for (let index = 0; index < target; index++) {
        const item = this.items[index]

        item.divider
          ? height += 1
          : height += 18
      }

      return height
    },
    reposition: function () {
      const overflow_x = this.position_x - (this.window_x / 2)
      const overflow_y = this.position_y - (this.window_y / 2)

      this.local_flip_x = this.flip_x === null ? overflow_x > 0 : this.flip_x
      this.local_flip_y = this.flip_y === null ? overflow_y > 0 : this.flip_y

      this.local_position_x = this.position_x - (this.local_flip_x ? this.width : 0)
      this.local_position_y = this.position_y - (this.local_flip_y ? this.height : 0)

      if (this.$refs.node) {
        this.$refs.node.style.zIndex = this.layer
        this.$refs.node.style.left = `${this.local_position_x}px`
        this.$refs.node.style.top = `${this.local_position_y}px`
      }
    },
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

      if (item.load) {
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
})
</script>
