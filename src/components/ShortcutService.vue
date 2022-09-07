<template>
  <div>
    <div v-shortkey.once="['esc']" @shortkey=escape />
    <div v-shortkey.once="['ctrl', '`']" @shortkey="layer('console')" />
    <div v-shortkey.once="['ctrl', 'e']" @shortkey="layer('edit')" />
    <div v-shortkey.once="['ctrl', 's']" @shortkey="layer('commit')" />
    <div v-shortkey.once="['ctrl', 'shift', 's']" @shortkey="$emit('quick-commit')" />
    <div v-shortkey.once="['ctrl', 'p']" @shortkey="layer('push')" />
    <div v-shortkey.once="['ctrl', 'f']" @shortkey="layer('search')" />
    <div v-shortkey.once="['ctrl', 'o']" @shortkey="$emit('open')" />
  </div>
</template>

<script>
import store from '@/store'

export default {
  computed: {
    system: function () {
      return store.state.system
    }
  },
  methods: {
    escape: async function () {
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
          return await store.dispatch(`system/${layer}`, false)
        }
      }

      return await store.dispatch('system/settings', true)
    },
    layer: async function (layer) {
      return await store.dispatch(`system/${layer}`, !this.system[layer])
    }
  }
}

</script>
