<template>
  <explorer-directory
    :name=tome.name
    :key=tome.path
    :path=tome.path
    :enabled=enabled
    :populate=populate
    @selected=selected
    v-on="$listeners"
  />
</template>

<script>
import store from '@/store'

export default {
  props: {
    enabled: { type: Boolean },
    populate: { type: Function },
    selected: { type: Function }
  },
  computed: {
    tome: function () {
      return store.state.tome
    }
  }
}
</script>
