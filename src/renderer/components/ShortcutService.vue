<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const system = computed(() => store.state.system)

onMounted(() => window.addEventListener('keyup', keyup))
onUnmounted(() => window.removeEventListener('keyup', keyup))

function keyup (event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
      escape()
      break;
  }

  if (!event.ctrlKey) {
    return
  }

  switch (event.key) {
    case '`':
      layer('console')
      break;

    case 'e':
      layer('edit')
      break;

    case 's':
      layer('commit')
      break;

    case 'S':
      perform('quick-commit')
      break;

    case 'p':
      layer('push')
      break;

    case 'f':
      layer('search')
      break;

    case 'o':
      select()
      break;
  }
}

async function escape () {
  const layers = [
    'settings',
    'console',
    'patch',
    'search',
    'branch',
    'push',
    'commit',
    'edit',
  ]

  for (const layer of layers) {
    if (system.value[layer]) {
      return await store.dispatch(`system/${layer}`, false)
    }
  }

  return await store.dispatch('system/settings', true)
}

async function layer (layer) {
  return await store.dispatch(`system/${layer}`, !system.value[layer])
}

async function perform (performance) {
  await store.dispatch('system/perform', performance)
}

async function select () {
  await store.dispatch('library/select')
}
</script>
