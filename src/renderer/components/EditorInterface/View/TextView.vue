<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    ref="root"
    class="root"
    id="mark-js-root"
    @contextmenu="contextmenu"
    v-html="rendered"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { marked } from 'marked'
import Mark from 'mark.js'
import { fetchStore, File } from '@/store'

const store = fetchStore()

export interface Props {
  file?: File,
}

const props = withDefaults(defineProps<Props>(), {
  file: undefined,
})

const root = ref<HTMLElement>(null)

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
    store.state.search.navigation.target
  ]
})

const actions = computed(() => {
  return store.state.actions.options.map(name => ({
    title: name,
    action: async () => {
      const selection = document.getSelection().toString()
      await store.dispatch('actions/execute', { name, target: props.file.path, selection })
    }
  }))
})

const context = computed(() => {
  return [
    {
      title: 'Action',
      load: () => actions.value
    },
    { divider: true },
    {
      title: 'Cut',
      active: () => false
    },
    {
      title: 'Copy',
      action: async () => {
        const selection = document.getSelection().toString()
        await store.dispatch('clipboard/text', selection)
      }
    },
    {
      title: 'Paste',
      active: () => false
    }
  ]
})

const rendered = computed((): string => {
  if (props.file === undefined || props.file.directory || !props.file.document) {
    return ''
  }

  const content = props.file.document.content || ''

  if (['.md'].includes(props.file.extension)) {
    return marked.parse(content)
  }

  if (['.htm', '.html'].includes(props.file.extension)) {
    return content
  }

  return ''
})

async function contextmenu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY
  }

  await store.dispatch('context/open', { items: context.value, position })
}

watch(search_state, async () => {
  await new Promise((resolve) => {
    mark.unmark({ done: resolve })
  })

  let regex: RegExp
  try {
    regex = new RegExp(
      search.value.regex_query ? search.value.query : String(search.value.query).replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&'),
      String('g').concat(search.value.case_sensitive ? '' : 'i')
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
        done: total => {
          store.dispatch('search/navigate', { total, target: undefined })
          resolve(total)
        }
      }
    )
  })

  results = [...root.value.querySelectorAll('mark > mark')]

  if (results.length !== total) {
    results = [...root.value.querySelectorAll('mark')]
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
  padding: 12px;
  overflow: scroll;
}

.root :deep(*) {
  padding: revert;
  margin: revert;
}

.highlight-rendered {
  background-color: rgba(255, 255, 0, 0.2) !important;
  outline: 2px solid rgba(255, 255, 0, 0.2);
}

.highlight-rendered-target {
  background-color: rgba(255, 255, 0, 0.4) !important;
  outline: 2px solid rgba(255, 255, 0, 0.4);
}
</style>
