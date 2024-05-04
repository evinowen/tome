<!-- eslint-disable vue/no-v-html -->
<template>
  <context
    dynamic
    :load="context_load"
    class="root"
  >
    <rendered-viewport
      id="mark-js-root"
      ref="root"
      :content="content"
    />
  </context>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Context from '@/components/Context.vue'
import RenderedViewport from '@/components/RenderedViewport.vue'
import Mark from 'mark.js'
import { fetchStore, File } from '@/store'
import RenderedViewportContextMenu from '@/context/RenderedViewportContextMenu'

const store = fetchStore()

export interface Properties {
  file?: File
}

const properties = withDefaults(defineProps<Properties>(), {
  file: undefined,
})

const root = ref<HTMLElement>(undefined)

let mark: Mark
let target: any
let results: Element[]

onMounted(() => {
  mark = new Mark('#mark-js-root')
})

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

function context_load () {
  const selection = document.getSelection().toString()
  return RenderedViewportContextMenu(store, selection)
}

watch(search_state, async () => {
  await new Promise((resolve) => {
    mark.unmark({ done: resolve })
  })

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

  const total = await new Promise((resolve) => {
    mark.markRegExp(
      regex,
      {
        className: 'highlight-rendered',
        acrossElements: false,
        done: (total) => {
          store.dispatch('search/navigate', { total, target: undefined })
          resolve(total)
        },
      },
    )
  })

  results = [ ...root.value.querySelectorAll('mark > mark') ]

  if (results.length !== total) {
    results = [ ...root.value.querySelectorAll('mark') ]
  }

  await search_navigate()
})

async function search_navigate () {
  if (target) {
    target.classList.remove('highlight-rendered-target')
  }

  target = results[search.value.navigation.target - 1]

  if (target) {
    target.classList.add('highlight-rendered-target')
    target.scrollIntoView()
  }
}
</script>

<style scoped>
.root {
  width: 100%;
  height: 100%;
}
</style>
