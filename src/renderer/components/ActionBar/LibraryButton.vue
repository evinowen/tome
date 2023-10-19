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

    <v-list density="compact">
      <v-list-item
        v-for="(item, index) in library.history"
        :key="index"
        density="compact"
        @click="open(item)"
      >
        <v-icon
          size="small"
          class="mr-1"
        >
          mdi-book
        </v-icon>
        <v-list-item-title>{{ item }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item @click="select">
        <v-icon
          size="small"
          class="mr-1"
        >
          mdi-folder-open
        </v-icon>
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
.v-btn--icon.v-size--small,
.v-btn--icon.v-size--small .v-icon {
  height: 18px;
}

.button {
  height: 18px !important;
}

.v-list-item {
  padding: 0 4px;
  min-height: 20px !important;
  min-width: 120px;
}

.v-list-item--link:before {
  background: inherit;
}

.v-list-item:hover,
.v-list-item:hover .item {
  color: var(--v-accent-lighten4) !important;
  background: var(--v-accent-darken2) !important;
}

.library-button {
  padding: 0px;
  height: 100%;
  width: 30px;
  min-height: 0;
  min-width: 30px;
}
</style>
