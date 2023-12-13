<template>
  <v-btn
    rounded="0"
    size="small"
    class="px-2 text-grey-lighten-1"
    style="height: 18px;"
  >
    <v-progress-circular
      :model-value="(waiting * 100) / waiting_max"
      :size="12"
      :width="2"
      color="warning"
      class="mr-2"
    />
    <strong
      v-if="available_added"
      class="text-green"
    >{{ available_added }}</strong>
    <strong v-else>0</strong>
    <strong>/</strong>
    <strong
      v-if="available_removed"
      class="text-red"
    >{{ available_removed }}</strong>
    <strong v-else>0</strong>
    <strong>&bull;</strong>
    <strong
      v-if="staged_added"
      class="text-lime"
    >{{ staged_added }}</strong>
    <strong v-else>0</strong>
    <strong>/</strong>
    <strong
      v-if="staged_removed"
      class="text-orange"
    >{{ staged_removed }}</strong>
    <strong v-else>0</strong>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface Props {
  available_modified: number,
  available_new: number,
  available_removed: number,
  available_renamed: number,
  staged_modified: number,
  staged_new: number,
  staged_removed: number,
  staged_renamed: number,
  waiting_max: number,
  waiting: number,
}

const props = withDefaults(defineProps<Props>(), {
  available_modified: 0,
  available_new: 0,
  available_removed: 0,
  available_renamed: 0,
  staged_modified: 0,
  staged_new: 0,
  staged_removed: 0,
  staged_renamed: 0,
  waiting_max: 0,
  waiting: 0,
})

const available_added = computed(() => {
  return props.available_new + props.available_renamed + props.available_modified
})

const staged_added = computed(() => {
  return props.staged_new + props.staged_renamed + props.staged_modified
})
</script>
