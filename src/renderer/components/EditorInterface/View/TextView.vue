<template>
  <context
    dynamic
    :load="context_load"
    class="viewport-root"
  >
    <rendered-viewport
      id="mark-js-root"
      ref="viewport"
      :directory="file.parent.path"
      :path="file.path"
      :type="file.subtype"
      :content="content"
    />
  </context>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Context from '@/components/Context.vue'
import RenderedViewport from '@/components/RenderedViewport.vue'
import File from '@/objects/File'
import { fetch_log_store } from '@/store/log'
import { fetch_search_store } from '@/store/modules/search'
import RenderedViewportContextMenu from '@/objects/context/menus/RenderedViewportContextMenu'

const log = fetch_log_store()
const search = fetch_search_store()

export interface Properties {
  file?: File
}

const properties = withDefaults(defineProps<Properties>(), {
  file: undefined,
})

const viewport = ref<InstanceType<typeof RenderedViewport>>()

const search_state = computed(() => {
  return [
    search.query,
    search.regex_query,
    search.case_sensitive,
    search.navigation.target,
  ]
})

const content = computed((): string => {
  if (properties.file === undefined || properties.file.directory || !properties.file.document) {
    return ''
  }

  return properties.file.document.content || ''
})

async function context_load () {
  return RenderedViewportContextMenu(document.getSelection().toString())
}

watch(search_state, async () => {
  await viewport.value.selection.clear()

  let regex: RegExp
  try {
    regex = new RegExp(
      search.regex_query ? search.query : String(search.query).replaceAll(/[$()*+./?[\\\]^{|}-]/g, '\\$&'),
      String('g').concat(search.case_sensitive ? '' : 'i'),
    )
  } catch (error) {
    await log.error(error.message, error.stack)
    return
  }

  const total = await viewport.value.selection.highlight(regex)
  search.navigate({ total, target: undefined })

  await viewport.value.selection.focus(search.navigation.target - 1)
})
</script>

<style scoped>
.viewport-root {
  width: 100%;
  height: 100%;
}
</style>
