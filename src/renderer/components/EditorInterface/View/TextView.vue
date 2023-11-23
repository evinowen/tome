<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    id="root"
    ref="root"
    @contextmenu="contextmenu"
    v-html="rendered"
  />
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative, Watch, Prop } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { marked } from 'marked'
import Mark from 'mark.js'
import { State, File, fetchStore } from '@/store'

@Component({})
class TextView extends Vue {
  $refs: {
    root: HTMLElement
  }

  @Prop({ type: File, default: undefined })
  file?: File

  @Setup(() => fetchStore())
  store: Store<State>

  mark?: Mark
  target?: any
  results: Element[]

  get search () {
    return this.store.state.search
  }

  get search_state () {
    return [
      this.store.state.search.query,
      this.store.state.search.regex_query,
      this.store.state.search.case_sensitive,
      this.store.state.search.navigation.target
    ]
  }

  mounted (): void {
    this.mark = new Mark('#root')
  }

  get actions () {
    return this.store.state.actions.options.map(name => ({
      title: name,
      action: async () => {
        const selection = document.getSelection().toString()
        await this.store.dispatch('actions/execute', { name, target: this.file.path, selection })
      }
    }))
  }

  get context () {
    return [
      {
        title: 'Action',
        load: () => this.actions
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
          await this.store.dispatch('clipboard/text', selection)
        }
      },
      {
        title: 'Paste',
        active: () => false
      }
    ]
  }

  async contextmenu (event) {
    const position = {
      x: event.clientX,
      y: event.clientY
    }

    await this.store.dispatch('context/open', { items: this.context, position })
  }

  get rendered (): string {
    if (this.file === undefined || this.file.directory || !this.file.document) {
      return ''
    }

    const content = this.file.document.content || ''

    if (['.md'].includes(this.file.extension)) {
      return marked.parse(content)
    }

    if (['.htm', '.html'].includes(this.file.extension)) {
      return content
    }

    return ''
  }

  @Watch('search_state')
  async search_mark () {
    // eslint-disable-next-line no-console
    console.log('search trigger')

    await new Promise((resolve) => {
      this.mark.unmark({ done: resolve })
    })

    let regex: RegExp
    try {
      regex = new RegExp(
        this.search.regex_query ? this.search.query : String(this.search.query).replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&'),
        String('g').concat(this.search.case_sensitive ? '' : 'i')
      )
    } catch (error) {
      await this.store.dispatch('error', error)
      return
    }

    const total = await new Promise((resolve) => {
      this.mark.markRegExp(
        regex,
        {
          className: 'highlight-rendered',
          acrossElements: false,
          done: total => {
            this.store.dispatch('search/navigate', { total, target: undefined })
            resolve(total)
          }
        }
      )
    })

    this.results = [...this.$refs.root.querySelectorAll('mark > mark')]

    if (this.results.length !== total) {
      this.results = [...this.$refs.root.querySelectorAll('mark')]
    }

    await this.search_navigate()
  }

  async search_navigate () {
    if (this.target) {
      this.target.classList.remove('highlight-rendered-target')
    }

    this.target = this.results[this.search.navigation.target - 1]

    if (this.target) {
      this.target.classList.add('highlight-rendered-target')
      this.target.scrollIntoView()
    }
  }
}

export default toNative(TextView)
</script>

<style scoped>
#root {
  width: 100%;
  height: 100%;
  padding: 12px;
  overflow: scroll;
}

#root :deep(*) {
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
