<template>
  <div>
    <v-divider />
    <v-textarea
      ref="input-field"
      v-model="model"
      class="monospace"
      persistent-placeholder
      required
      clearable
      auto-grow
      no-resize
      hide-details
      :rounded="0"
      :error="model.length > max_length"
      @update:model-value="throttle_update"
      @focus="focus"
      @blur="blur"
    />
    <div class="mx-2 pt-1 pb-2 d-flex monospace">
      <div style="flex-grow: 1; white-space: nowrap;">
        {{ model.length }} / {{ max_length }}
      </div>
      <div class="signature">
        <span
          :class="[
            'signature_name',
            { 'signature_error': configuration.active.signature.name.length === 0 },
          ]"
        >
          <template v-if="configuration.active.signature.name">
            {{ configuration.active.signature.name }}
          </template>
          <template v-else>
            Signature Name is Blank
          </template>
        </span>
        <span
          :class="[
            'signature_email',
            { 'signature_error': configuration.active.signature.email.length === 0 },
          ]"
        >
          <template v-if="configuration.active.signature.email">
            &lt;{{ configuration.active.signature.email }}&gt;
          </template>
          <template v-else>
            &lt;Signature E-Mail is Blank&gt;
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { throttle } from 'lodash'
import { VDivider, VTextarea } from 'vuetify/components'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'

interface Properties {
  max_length?: number
}

withDefaults(defineProps<Properties>(), {
  max_length: 72,
})

const configuration = fetch_configuration_store()
const repository_committer = fetch_repository_committer_store()

const model = ref(repository_committer.message)
const focused = ref(false)
watch(() => repository_committer.message, () => {
  if (!focused.value) {
    sync()
  }
})

function sync () {
  model.value = repository_committer.message
}

function focus () {
  focused.value = true
  sync()
}

function blur () {
  focused.value = false
  sync()
}

const throttle_update = throttle(update, 200)
async function update (value) {
  await repository_committer.compose(value)
}

defineExpose({
  blur,
  focus,
  focused,
  model,
  update,
})
</script>

<style scoped>
.readonly :deep(*) {
  cursor: default !important;
}

.monospace {
  font-family: var(--font-monospace), Monospace;
  font-size: var(--font-monospace-size)
}

.signature {
  flex-grow: 1;
  text-align: right;
}

.signature_name,
.signature_email {
  white-space: nowrap;
}

.signature_error {
  color: red;
}
</style>
