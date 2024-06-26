<template>
  <div
    ref="overlay"
    :class="[
      'overlay',
      { 'active': input_select.visible },
    ]"
    @click.stop="close"
  >
    <div
      ref="input"
      class="input"
      :style="{
        'top': `${top}px`,
        'left': `${left}px`,
        'height': `${height}px`,
        'width': `${width}px`,
        'padding': '5px 0px',
      }"
    >
      <div class="options">
        <v-list class="ma-0 pa-0">
          <v-list-item
            v-for="option in input_select.active"
            :key="option.value"
            class="option"
            @click.stop="select(input_select.identifier, option)"
          >
            <v-list-item-title>
              {{ option.label }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="option.detail">
              {{ option.detail }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Unable to use 'export { Option }' without error in this case
import { fetch_input_select_store, Option as SelectOption } from '@/store/modules/input/select'
export type Option = SelectOption

</script>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
  VList,
  VListItem,
  VListItemTitle,
  VListItemSubtitle,
} from 'vuetify/components'

const input_select = fetch_input_select_store()

const overlay = ref<HTMLElement>()
const input = ref<HTMLElement>()

const top = ref(0)
const left = ref(0)
const height = ref(120)
const width = ref(0)

watchEffect(() => {
  if (input_select.element && overlay.value) {
    const overlay_viewport = overlay.value.getBoundingClientRect()
    const element_viewport = input_select.element.getBoundingClientRect()

    const middle = overlay.value.offsetHeight / 2

    if ((element_viewport.bottom - overlay_viewport.top) - (input_select.element.offsetHeight / 2) > middle) {
      height.value = (element_viewport.top - overlay_viewport.top)
      top.value = 0
      input.value.classList.remove('input-bottom')
      input.value.classList.add('input-top')
    } else {
      height.value = overlay.value.offsetHeight - (element_viewport.bottom - overlay_viewport.top)
      top.value = (element_viewport.bottom - overlay_viewport.top)
      input.value.classList.remove('input-top')
      input.value.classList.add('input-bottom')
    }

    left.value = element_viewport.left
    width.value = input_select.element.offsetWidth
  }
})

async function select (identifier: string, option: Option) {
  input_select.select({ identifier, option })
}

async function close () {
  input_select.close()
}

defineExpose({
  select,
  close,
})
</script>

<style scoped>
.overlay {
  --system-bar-height: 25px;

  height: calc(100vh - var(--system-bar-height));
  left: 0;
  position: fixed;
  top: var(--system-bar-height);
  width: 100vw;
  opacity: 0;
  pointer-events: none;
  z-index: 100000;
  transition: opacity 0.25s ease-in-out;
}

.overlay.active {
  opacity: 1;
  pointer-events: all;
}

.input {
  position: absolute;
  display: flex;
  flex-direction: column;
}

.input-top {
  justify-content: end;
}

.input-bottom {
  justify-content: start;
}

.options {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
  max-height: 240px;
  overflow-y: scroll;
}

.option {
  cursor: pointer;
  transition: all 0.25s ease-in-out;
}

.option:hover {
  background: rgb(var(--v-theme-on-surface), 0.1);
}
</style>
