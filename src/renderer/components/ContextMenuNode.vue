<template>
  <div
    ref="node"
    v-click-outside="{ handler: () => $emit('close'), closeConditional: () => root, include }"
    class="context-menu"
  >
    <v-list
      density="compact"
      class="context-menu-list"
    >
      <v-list-subheader>{{ title || '&nbsp;' }}</v-list-subheader>
      <v-divider />
      <div
        v-for="(item, index) in items"
        :key="index"
      >
        <v-divider v-if="item.divider" />
        <v-list-item
          v-else
          :disabled="item.active ? !item.active() : false"
          :inactive="item.action ? false : true"
          @click.stop="execute(item.action)"
          @mouseover="promote(index)"
        >
          <v-list-item-title
            class="item"
            style="line-height: 16px !important;"
          >
            <v-layout>
              <v-col
                class="menu-arrow shrink"
              >
                <v-icon
                  v-show="local_flip_x && (item.items || item.load)"
                  size="small"
                >
                  {{ local_flip_x && (item.items || item.load) ? "mdi-menu-left" : "" }}
                </v-icon>
              </v-col>
              <v-col class="grow">
                {{ item.title }}
              </v-col>
              <v-col
                class="menu-arrow shrink"
              >
                <v-icon
                  v-show="!local_flip_x && (item.items || item.load)"
                  size="small"
                >
                  {{ !local_flip_x && (item.items || item.load) ? "mdi-menu-right" : "" }}
                </v-icon>
              </v-col>
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
          :title="item.title"
          :target="target"
          :items="item.items"
          :layer="layer + 1"
          @mouseover="activate(index)"
          @mouseleave="deactivate(index)"
          @close="$emit('close')"
        />
      </div>
    </v-list>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, toNative } from 'vue-facing-decorator'
import { VLayout, VCol, VList, VListItem, VListItemTitle, VListSubheader, VIcon, VDivider } from 'vuetify/components'
import { ClickOutside } from 'vuetify/directives'
import ResizeObserver from 'resize-observer-polyfill'

@Component({
  name: 'ContextMenuNode',
  components: { VLayout, VCol, VList, VListItem, VListItemTitle, VListSubheader, VIcon, VDivider },
  directives: { ClickOutside }
})
class ContextMenuNode extends Vue {
  @Prop({ default: undefined })
  title?: string

  @Prop({ default: false })
  root: boolean

  @Prop({ default: undefined })
  target?: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Prop({ default: () => [] })
  items: any[]

  @Prop({ default: 0 })
  position_x: number

  @Prop({ default: 0 })
  position_y: number

  @Prop({ default: undefined })
  flip_x?: boolean

  @Prop({ default: undefined })
  flip_y?: boolean

  @Prop({ default: 0 })
  window_x: number

  @Prop({ default: 0 })
  window_y: number

  @Prop({ default: 0 })
  layer: number

  $refs: {
    node: HTMLElement
  }

  active = -1
  promoted = -1
  width = 0
  height = 0
  local_position_x = 0
  local_position_y = 0
  local_flip_x = false
  local_flip_y = false
  resize_observer?: ResizeObserver

  @Watch('position_x')
  position_x_update () {
    this.reposition()
  }

  @Watch('position_y')
  position_y_update () {
    this.reposition()
  }

  @Watch('flip_x')
  flip_x_update () {
    this.reposition()
  }

  @Watch('flip_y')
  flip_y_update () {
    this.reposition()
  }

  mounted () {
    this.resize_observer = new ResizeObserver(this.resize)
    this.resize_observer.observe(this.$refs.node)
  }

  include () {
    const result = [...this.$refs.node.querySelectorAll('*,* > *')]
    return result
  }

  resize () {
    if (this.$refs.node) {
      this.width = this.$refs.node.clientWidth
      this.height = this.$refs.node.clientHeight
    }

    this.reposition()
  }

  offset (target) {
    let height = 19

    for (let index = 0; index < target; index++) {
      const item = this.items[index]

      item.divider
        ? height += 1
        : height += 18
    }

    return height
  }

  reposition () {
    const overflow_x = this.position_x - (this.window_x / 2)
    const overflow_y = this.position_y - (this.window_y / 2)

    this.local_flip_x = this.flip_x === undefined ? overflow_x > 0 : this.flip_x
    this.local_flip_y = this.flip_y === undefined ? overflow_y > 0 : this.flip_y

    this.local_position_x = this.position_x - (this.local_flip_x ? this.width : 0)
    this.local_position_y = this.position_y - (this.local_flip_y ? this.height : 0)

    if (this.$refs.node) {
      this.$refs.node.style.zIndex = `${this.layer}`
      this.$refs.node.style.left = `${this.local_position_x}px`
      this.$refs.node.style.top = `${this.local_position_y}px`
    }
  }

  activate (index) {
    this.promote(index)
    this.active = index
  }

  deactivate (index) {
    if (this.active !== index) {
      return
    }

    this.active = -1
  }

  async promote (index) {
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
  }

  async execute (action) {
    if (action === undefined) {
      return
    }

    this.$emit('close')
    await action(this.target)
  }
}

export default toNative(ContextMenuNode)
</script>

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

.context-menu-list .v-list-subheader {
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
