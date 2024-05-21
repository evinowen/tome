<template>
  <div
    ref="base"
    v-click-outside.prevent="{ handler: () => focus(false), include }"
    style="position: relative;"
  >
    <v-text-field
      ref="input"
      :model-value="model"
      density="compact"
      variant="solo"
      hide-details
      clearable
      :placeholder="placeholder"
      :label="label"
      :append-inner-icon="open ? 'mdi-menu-up' : 'mdi-menu-down'"
      @click:clear="emit('update')"
      @update:model-value="update"
      @update:focused="(value) => !value || focus(true)"
    />
  </div>
</template>

<script lang="ts">
// Unable to use 'export { Option }' without error in this case
import { Option as SelectOption } from '@/store/modules/input/select'
export type Option = SelectOption

</script>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { fetchStore } from '@/store'
import { VTextField } from 'vuetify/components'
import { ClickOutside as vClickOutside } from 'vuetify/directives'

export interface Properties {
  error?: boolean
  label: string
  value: string
  placeholder?: string
  options: Option[]
}

const properties = withDefaults(defineProps<Properties>(), {
  error: false,
  value: '',
  label: '',
  placeholder: '',
})

const emit = defineEmits([
  'update',
])

const store = fetchStore()

const base = ref<HTMLElement>()
const input = ref<HTMLElement>()
const identifier = ref<string>()
const model = ref('')

watchEffect(() => update(properties.value))

const open = computed(() => store.state.input.select.identifier === identifier.value)

function include () {
  return [ ...base.value.querySelectorAll('*') ]
}

async function focus (value) {
  if (value) {
    identifier.value = await store.dispatch('input/select/show', { element: base.value, set, options: properties.options })
  }
}

async function update (value) {
  model.value = value
  await store.dispatch('input/select/filter', { identifier: identifier.value, value })
}

function set (option: Option) {
  model.value = option.label
  emit('update', option.value)
}

defineExpose({
  identifier,
  base,
  focus,
  update,
  set,
})
</script>

<style scoped>
.options {
  overflow-y: scroll;
  overflow: none;
  padding: 0;
  position: fixed;
  width: inherit;
  z-index: 10000;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
}

.option {
  padding-inline: 0;
  width: inherit;
}
</style>
