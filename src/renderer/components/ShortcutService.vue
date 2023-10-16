<template>
  <div>
    <div
      v-shortkey.once="['esc']"
      @shortkey="escape"
    />
    <div
      v-shortkey.once="['ctrl', '`']"
      @shortkey="layer('console')"
    />
    <div
      v-shortkey.once="['ctrl', 'e']"
      @shortkey="layer('edit')"
    />
    <div
      v-shortkey.once="['ctrl', 's']"
      @shortkey="layer('commit')"
    />
    <div
      v-shortkey.once="['ctrl', 'shift', 's']"
      @shortkey="perform('quick-commit')"
    />
    <div
      v-shortkey.once="['ctrl', 'p']"
      @shortkey="layer('push')"
    />
    <div
      v-shortkey.once="['ctrl', 'f']"
      @shortkey="layer('search')"
    />
    <div
      v-shortkey.once="['ctrl', 'o']"
      @shortkey="select()"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: {}
})
class ShortcutService extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  get system () {
    return this.store.state.system
  }

  async escape () {
    const layers = [
      'settings',
      'console',
      'patch',
      'search',
      'branch',
      'push',
      'commit',
      'edit'
    ]

    for (const layer of layers) {
      if (this.system[layer]) {
        return await this.store.dispatch(`system/${layer}`, false)
      }
    }

    return await this.store.dispatch('system/settings', true)
  }

  async layer (layer) {
    return await this.store.dispatch(`system/${layer}`, !this.system[layer])
  }

  async perform (performance) {
    await this.store.dispatch('system/perform', performance)
  }

  async select () {
    await this.store.dispatch('library/select')
  }
}

export default toNative(ShortcutService)
</script>
