<template>
  <context
    dynamic
    :load="context_load"
    class="viewport-root"
  >
    <rendered-viewport
      id="mark-js-root"
      ref="viewport"
      :content="content"
    />
  </context>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Context from '@/components/Context.vue'
import RenderedViewport from '@/components/RenderedViewport.vue'
import { fetchStore, File } from '@/store'
import RenderedViewportContextMenu from '@/objects/context/menus/RenderedViewportContextMenu'

const store = fetchStore()

export interface Properties {
  file?: File
}

const properties = withDefaults(defineProps<Properties>(), {
  file: undefined,
})

const viewport = ref<InstanceType<typeof RenderedViewport>>()

const search = computed(() => {
  return store.state.search
})

const search_state = computed(() => {
  return [
    store.state.search.query,
    store.state.search.regex_query,
    store.state.search.case_sensitive,
    store.state.search.navigation.target,
  ]
})

const content = computed((): string => {
  if (properties.file === undefined || properties.file.directory || !properties.file.document) {
    return ''
  }

  if (![ '.md' ].includes(properties.file.extension)) {
    return ''
  }

  return properties.file.document.content || ''
})

async function context_load () {
  return RenderedViewportContextMenu(store, document.getSelection().toString())
}

watch(search_state, async () => {
  await viewport.value.selection.clear()

  let regex: RegExp
  try {
    regex = new RegExp(
      search.value.regex_query ? search.value.query : String(search.value.query).replaceAll(/[$()*+./?[\\\]^{|}-]/g, '\\$&'),
      String('g').concat(search.value.case_sensitive ? '' : 'i'),
    )
  } catch (error) {
    await store.dispatch('error', error)
    return
  }

  const total = await viewport.value.selection.highlight(regex)
  store.dispatch('search/navigate', { total, target: undefined })

  await viewport.value.selection.focus(search.value.navigation.target - 1)
})
</script>

<style scoped>
.viewport-root {
  width: 100%;
  height: 100%;
}
</style>
