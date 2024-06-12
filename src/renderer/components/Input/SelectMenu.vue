<template>
  <div
    ref="base"
    v-click-outside.prevent="{ handler: blur, include }"
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
      @update:focused="(value) => !value || focus()"
    />
  </div>
</template>

<script lang="ts">
import { Option as SelectOption } from '@/store/modules/input/select'
export type Option = SelectOption

</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetch_input_select_store } from '@/store/modules/input/select'
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

const input_select = fetch_input_select_store()

const base = ref<HTMLElement>()
const input = ref<InstanceType<typeof VTextField>>()
const identifier = ref<string>()
const model = ref(properties.value)

watch(() => properties.value, () => update(properties.value))

const open = computed(() => input_select.identifier === identifier.value)

function include () {
  return [ ...base.value.querySelectorAll('*') ]
}

async function focus () {
  identifier.value = await input_select.show({ element: base.value, set, options: properties.options })
}

async function blur () {
  input.value.blur()
  identifier.value = ''
}

async function update (value) {
  model.value = value
  await input_select.filter({ identifier: identifier.value, value })
}

function set (option: Option) {
  model.value = option.label
  emit('update', option.value)
}

defineExpose({
  base,
  blur,
  focus,
  identifier,
  open,
  set,
  update,
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
