<template>
  <div
    ref="node"
    v-click-outside.prevent="{ handler: () => $emit('close'), closeConditional: () => root, include }"
    class="context-menu"
  >
    <v-list
      density="compact"
      class="context-menu-list"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="context-menu-item"
      >
        <context-menu-item
          :item="item"
          :point="local_flip_x ? 'left' : 'right'"
          @close="$emit('close')"
          @promote="promote(index)"
        />
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
          @close="$emit('close')"
          @mouseover="activate(index)"
          @mouseleave="deactivate(index)"
        />
      </div>
    </v-list>
  </div>
</template>

<script lang="ts">
import ContextMenuItem from './ContextMenuItem.vue'
import {
  VList,
} from 'vuetify/components'
import {
  ClickOutside,
} from 'vuetify/directives'

export default {
  name: 'ContextMenuNode',
  components: {
    ContextMenuItem,
    VList,
  },
  directives: {
    ClickOutside,
  },
}
</script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'

export interface Properties {
  title?: string
  root?: boolean
  target?: string
  items: any[]
  position_x: number
  position_y: number
  flip_x?: boolean
  flip_y?: boolean
  window_x?: number
  window_y?: number
  layer?: number
}

const properties = withDefaults(defineProps<Properties>(), {
  title: undefined,
  root: false,
  target: undefined,
  items: () => [],
  position_x: 0,
  position_y: 0,
  flip_x: undefined,
  flip_y: undefined,
  window_x: 0,
  window_y: 0,
  layer: 0,
})

const emit = defineEmits([
  'close',
])

const node = ref<HTMLElement>(undefined)

const active = ref(-1)
const promoted = ref(-1)
const width = ref(0)
const height = ref(0)
const local_position_x = ref(0)
const local_position_y = ref(0)
const local_flip_x = ref(false)
const local_flip_y = ref(false)

let resize_observer: ResizeObserver

watch(() => properties.position_x, reposition)
watch(() => properties.position_y, reposition)
watch(() => properties.flip_x, reposition)
watch(() => properties.flip_y, reposition)

onMounted(() => {
  resize_observer = new ResizeObserver(resize)
  resize_observer.observe(node.value)
})

function include () {
  return [ ...node.value.querySelectorAll('*') ]
}

function resize () {
  if (node.value) {
    width.value = node.value.clientWidth
    height.value = node.value.clientHeight
  }

  reposition()
}

function offset (target) {
  let height = 19

  for (let index = 0; index < target; index++) {
    const item = properties.items[index]

    item.divider
      ? height += 1
      : height += 18
  }

  return height
}

function reposition () {
  const overflow_x = properties.position_x - (properties.window_x / 2)
  const overflow_y = properties.position_y - (properties.window_y / 2)

  local_flip_x.value = properties.flip_x === undefined ? overflow_x > 0 : properties.flip_x
  local_flip_y.value = properties.flip_y === undefined ? overflow_y > 0 : properties.flip_y

  local_position_x.value = properties.position_x - (local_flip_x.value ? width.value : 0)
  local_position_y.value = properties.position_y - (local_flip_y.value ? height.value : 0)

  if (node.value) {
    node.value.style.zIndex = `${properties.layer}`
    node.value.style.left = `${local_position_x.value}px`
    node.value.style.top = `${local_position_y.value}px`
  }
}

async function activate (index) {
  await promote(index)
  active.value = index
}

function deactivate (index) {
  if (active.value !== index) {
    return
  }

  active.value = -1
}

async function promote (index) {
  if (promoted.value === index) {
    return
  }

  active.value = -1
  promoted.value = -1

  const item = properties.items[index]

  if (item.load) {
    item.items = await item.load()
  }

  promoted.value = index
}

defineExpose({
  active,
  activate,
  deactivate,
  promoted,
  promote,
  local_position_x,
  local_position_y,
})
</script>

<style scoped>
.v-list-item--link:before {
  background: inherit;
}

.v-list-item:hover {
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
}

.context-menu {
  position: fixed;
  user-select: none;
}

.context-menu :deep(*) {
  user-select: none;
}

.context-menu-list {
  border-radius: 6px;
  outline: 1px solid rgba(var(--v-theme-on-surface), 0.25);
  min-width: 160px;
  padding: 2px;
  min-height: 20px;
}

.context-menu-list :first-child.context-menu-item .v-list-item {
  border-radius: 5px 5px 0 0;
}

.context-menu-list :last-child.context-menu-item .v-list-item {
  border-radius: 0 0 5px 5px;
}

.context-menu-list :deep(.v-list-subheader) {
  min-height: 0;
  padding: 4px;
  padding-bottom: 2px;
}

.context-menu-list :deep(.v-list-item) {
  min-height: 0;
  padding: 1px;
  font-weight: normal;
}
</style>
