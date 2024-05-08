<template>
  <v-divider
    v-if="item.divider"
    class="my-1"
  />
  <v-list-item
    v-else
    :disabled="item.active ? !(item.active()) : false"
    :inactive="item.action ? false : true"
    @click.stop="execute(item)"
    @mouseover="promote"
  >
    <v-list-item-title
      class="item"
      style="line-height: 16px !important;"
    >
      <div class="menu-item">
        <div class="menu-arrow">
          <v-icon
            v-show="parent && (direction === 'left')"
            size="small"
          >
            mdi-menu-left
          </v-icon>
        </div>
        <div class="menu-text">
          {{ item.title }}
        </div>
        <div class="menu-shortcut">
          {{ item.shortcut() }}
        </div>
        <div class="menu-arrow">
          <v-icon
            v-show="parent && (direction === 'right')"
            size="small"
          >
            mdi-menu-right
          </v-icon>
        </div>
      </div>
    </v-list-item-title>
  </v-list-item>
</template>

<script lang="ts">
import {
  VDivider,
  VIcon,
  VListItem,
  VListItemTitle,
} from 'vuetify/components'
import {
  ClickOutside,
} from 'vuetify/directives'

export default {
  name: 'ContextMenuNode',
  components: {
    VDivider,
    VIcon,
    VListItem,
    VListItemTitle,
  },
  directives: {
    ClickOutside,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import ContextItem from '@/objects/context/ContextItem'

export interface Properties {
  item: ContextItem
  direction: 'left' | 'right'
}

const properties = withDefaults(defineProps<Properties>(), {
  item: undefined,
  direction: undefined,
})

const emit = defineEmits([
  'close',
  'promote',
])

const parent = computed(() => Boolean(properties.item.items || properties.item.load))

async function promote () {
  await properties.item.display()
  emit('promote')
}

async function execute (item: ContextItem) {
  if (item.action === undefined) {
    return
  }

  emit('close')

  await item.execute()
}

defineExpose({
  execute,
  parent,
  promote,
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

.menu-item {
  display: flex;
}

.menu-arrow {
  flex-grow: 0;
  flex-shrink: 0;
  width: 1.5em;
  padding: 1px;
}

.menu-text {
  flex-grow: 1;
  text-align: left;
  padding: 1px;
}

.menu-shortcut {
  flex-grow: 0;
  flex-shrink: 0;
  text-align: right;
  padding: 1px;
  padding-left: 1em;
}
</style>
