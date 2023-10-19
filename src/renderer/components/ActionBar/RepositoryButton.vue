<template>
  <v-menu
    location="top"
    :model-value="value"
    transition="slide-y-reverse-transition"
    content-class="menu"
    :close-on-content-click="false"
    width="50%"
    @update:model-value="value = !value"
  >
    <template #activator="{ props }">
      <v-btn
        rounded="0"
        size="small"
        class="button pa-0 px-2"
        v-bind="props"
        :disabled="disabled"
      >
        {{ name }}
      </v-btn>
    </template>

    <v-card rounded="0">
      <v-card-title>{{ name }}</v-card-title>
      <v-card-subtitle>{{ path }}</v-card-subtitle>
      <v-card-actions>
        <v-btn
          variant="text"
          :disabled="!license"
          @click="open(license)"
        >
          License
        </v-btn>
      </v-card-actions>
      <v-divider />
      <v-card-actions>
        <v-btn
          variant="text"
          :disabled="!readme"
          @click="open(readme)"
        >
          Read Me
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="!authors"
          @click="open(authors)"
        >
          Authors
        </v-btn>
        <v-btn
          variant="text"
          :disabled="!contributors"
          @click="open(contributors)"
        >
          Contributors
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VCardActions, VCard, VCardTitle, VBtn, VSpacer, VDivider, VCardSubtitle, VMenu } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { VCardActions, VCard, VCardTitle, VBtn, VSpacer, VDivider, VCardSubtitle, VMenu }
})
class RepositoryButton extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: '' })
  name: string

  @Prop({ default: '' })
  path: string

  @Prop({ default: '' })
  readme: string

  @Prop({ default: '' })
  authors: string

  @Prop({ default: '' })
  contributors: string

  @Prop({ default: '' })
  license: string

  @Prop({ default: false })
  disabled: boolean

  value = false

  async open (path) {
    this.value = false
    await this.store.dispatch('files/select', { path })
  }
}

export default toNative(RepositoryButton)
</script>

<style scoped>
.button {
  height: 18px !important;
}

.menu {
  left: 2px !important;
  top: auto !important;
  bottom: 21px !important;
}
</style>
