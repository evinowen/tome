<template>
  <v-btn
    rounded="0"
    size="small"
    class="px-2 text-grey-lighten-1"
    style="height: 18px;"
  >
    <v-progress-circular
      :model-value="(waiting * 100) / waiting_max"
      :size="12"
      :width="2"
      color="warning"
      class="mr-2"
    />
    <strong
      v-if="available_added"
      class="text-green"
    >{{ available_added }}</strong>
    <strong v-else>0</strong>
    <strong>/</strong>
    <strong
      v-if="available_removed"
      class="text-red"
    >{{ available_removed }}</strong>
    <strong v-else>0</strong>
    <strong>&bull;</strong>
    <strong
      v-if="staged_added"
      class="text-lime"
    >{{ staged_added }}</strong>
    <strong v-else>0</strong>
    <strong>/</strong>
    <strong
      v-if="staged_removed"
      class="text-orange"
    >{{ staged_removed }}</strong>
    <strong v-else>0</strong>
  </v-btn>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'

@Component({
  components: {}
})
class StatusButton extends Vue {
  @Prop({ default: 0 })
  waiting: number

  @Prop({ default: 0 })
  waiting_max: number

  @Prop({ default: 0 })
  available_new: number

  @Prop({ default: 0 })
  available_renamed: number

  @Prop({ default: 0 })
  available_modified: number

  @Prop({ default: 0 })
  available_removed: number

  @Prop({ default: 0 })
  staged_new: number

  @Prop({ default: 0 })
  staged_renamed: number

  @Prop({ default: 0 })
  staged_modified: number

  @Prop({ default: 0 })
  staged_removed: number

  get available_added () {
    return this.available_new + this.available_renamed + this.available_modified
  }

  get staged_added () {
    return this.staged_new + this.staged_renamed + this.staged_modified
  }
}

export default toNative(StatusButton)
</script>
