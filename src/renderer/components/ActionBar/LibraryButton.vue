<template>
  <v-menu :model-value="value">
    <template #activator="{ props }">
      <v-btn
        v-if="repository.path"
        action-bar-bookshelf
        rounded="0"
        size="small"
        color="accent"
        variant="flat"
        class="library-button"
        :disabled="disabled"
        @click.stop="close"
      >
        <v-icon
          size="small"
          style="transform: rotate(180deg);"
        >
          mdi-exit-to-app
        </v-icon>
      </v-btn>
      <v-btn
        v-else
        action-bar-bookshelf
        rounded="0"
        size="small"
        color="accent"
        variant="flat"
        class="library-button"
        v-bind="props"
        :disabled="disabled"
      >
        <v-icon size="small">
          mdi-bookshelf
        </v-icon>
      </v-btn>
    </template>

    <v-list
      class="library-menu"
      density="compact"
    >
      <v-list-item
        v-for="(item, index) in library.history"
        :key="index"
        density="compact"
        prepend-icon="mdi-book"
        @click="open(item)"
      >
        <v-list-item-title>{{ item }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item
        prepend-icon="mdi-folder-open"
        @click="select"
      >
        <v-list-item-title>Select ...</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VBtn, VDivider, VIcon, VMenu, VList, VListItem, VListItemTitle } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: {
    VBtn,
    VDivider,
    VIcon,
    VMenu,
    VList,
    VListItem,
    VListItemTitle
  }
})
class LibraryButton extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: false })
  value: boolean

  @Prop({ default: false })
  disabled: boolean

  get repository () {
    return this.store.state.repository
  }

  get library () {
    return this.store.state.library
  }

  async select () {
    await this.store.dispatch('library/select')
  }

  async open (item) {
    await this.store.dispatch('library/open', item)
  }

  async close () {
    await this.store.dispatch('library/close')
  }
}

export default toNative(LibraryButton)
</script>

<style scoped>
.library-button {
  padding: 0px;
  height: 100%;
  width: 30px;
  min-height: 0;
  min-width: 30px;
}

.library-menu :deep(.v-list-item) {
  padding: 0 4px;
  min-height: 20px;
  min-width: 120px;
}

.library-menu :deep(.v-list-item--one-line) {
  padding-inline-start: 6px;
  padding-inline-end: 6px;
}

.library-menu :deep(.v-list-item__spacer) {
  width: 12px;
}

.library-menu :deep(.v-list-item-title) {
  font-size: 0.8em;
}
</style>
