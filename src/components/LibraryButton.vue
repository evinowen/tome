<template>
  <v-menu :value=value @input="$emit('input', $event)" >
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-if="tome.path" action-bar-bookshelf tile icon small color="accent" class="pa-0" v-bind="attrs" @click.stop=close :disabled=disabled>
        <v-icon small style="transform: rotate(180deg);">mdi-exit-to-app</v-icon>
      </v-btn>
      <v-btn v-else action-bar-bookshelf tile icon small color="accent" class="pa-0" v-bind="attrs" v-on="on" :disabled=disabled>
        <v-icon small>mdi-bookshelf</v-icon>
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item dense
        v-for="(item, index) in history"
        :key="index"
        @click="open(item)"
      >
        <v-icon small class="mr-1">mdi-book</v-icon>
        <v-list-item-title>{{ item }}</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item @click=select>
        <v-icon small class="mr-1">mdi-folder-open</v-icon>
        <v-list-item-title>Select ...</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

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
</style>

<script>
import { VBtn, VDivider, VIcon, VMenu, VList, VListItem, VListItemTitle } from 'vuetify/lib'
import store from '@/store'

export default {
  components: {
    VBtn,
    VDivider,
    VIcon,
    VMenu,
    VList,
    VListItem,
    VListItemTitle
  },
  props: {
    value: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  methods: {
    select: async function () {
      await store.dispatch('library/select')
    },
    open: async function (item) {
      await store.dispatch('library/open', item)
    },
    close: async function (item) {
      await store.dispatch('library/close')
    }
  },
  computed: {
    tome: function () {
      return store.state.tome
    },
    history: function () {
      return store.state.library.history
    }
  }
}
</script>
