<template>
  <form
    v-show="active"
    class="form"
    @submit.prevent="submit"
    @keydown.stop
  >
    <input
      ref="input"
      class="input"
      :value="model"
      @input="update"
      @click.stop
      @keyup.stop="keyup"
      @blur="blur"
    >
    <div
      v-show="error !== ''"
      class="error"
    >
      <v-icon>
        mdi-alert-circle
      </v-icon>
      {{ error }}
    </div>
  </form>
</template>

<script lang="ts">
import {
  VIcon,
} from 'vuetify/components'

export default {
  components: {
    VIcon,
  },
}
</script>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_validation_store } from '@/store/modules/validation'

export interface Properties {
  path: string
  active?: boolean
  directory?: boolean
  value: string
}

const properties = withDefaults(defineProps<Properties>(), {
  active: false,
  directory: false,
  value: '',
})

const configuration = fetch_configuration_store()
const files = fetch_files_store()
const validation = fetch_validation_store()

const input = ref<HTMLInputElement>()
const model = ref<string>('')
const error = ref<string>('')

watch(() => properties.active, async (value) => {
  if (value) {
    model.value = properties.value

    await nextTick()
    input.value.focus()
    input.value.select()
  }
})

function keyup (event: KeyboardEvent) {
  if (event.key === 'Escape') {
    input.value.blur()
  }
}

async function blur () {
  await validation.hide(input.value)

  await files.blur({ path: properties.path })
}

async function update () {
  await validate(input.value)
}

const rules = {
  base: [
    (value: string) => value.search(/[^\s\w.-]/g) === -1 || 'Special characters are not allowed',
    (value: string) => value.search(/[.-]{2,}/g) === -1 || 'Adjacent divider characters are not allowed',
  ],
  formatted: [
    (value: string) => value.search(/[^\w- ]/g) === -1 || 'Special characters are not allowed.',
  ],
  unformatted: [
    (value: string) => value.search(/ /g) === -1 || 'Whitespace is not allowed.',
  ],
  file: [
    (value: string) => value.search(/\.\w+$/g) !== -1 || 'File extension is required.',
    (value: string) => value.search(/^.+\.\w+/g) !== -1 || 'File name is required.',
  ],
}

async function validate (target: HTMLInputElement) {
  const value = target.value
  model.value = value

  try {
    for (const rule of rules.base) {
      const result = rule(value)
      if (result !== true) {
        throw new Error(result)
      }
    }

    if (configuration.active.format_explorer_titles) {
      for (const rule of rules.formatted) {
        const result = rule(value)
        if (result !== true) {
          throw new Error(result)
        }
      }
    } else {
      for (const rule of rules.unformatted) {
        const result = rule(value)
        if (result !== true) {
          throw new Error(result)
        }
      }

      if (!properties.directory) {
        for (const rule of rules.file) {
          const result = rule(value)
          if (result !== true) {
            throw new Error(result)
          }
        }
      }
    }
  } catch (error) {
    await validation.show(error.message, target)

    return false
  }

  await validation.hide(target)

  return true
}

async function submit () {
  if (await validate(input.value)) {
    await files.submit({
      input: input.value.value,
      title: configuration.active.format_explorer_titles,
    })
  }
}

defineExpose({
  input,
  submit,
  validate,
})
</script>

<style scoped>
.form {
  flex-grow: 1;
  position: relative;
}

.input {
  font-size: 0.8em;
  outline: none;
  height: 100%;
  width: 100%;
}
</style>
