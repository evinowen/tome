<template>
  <explorer-directory
    :name=tome.name
    :key=tome.path
    :path=tome.path
    :enabled=enabled
    :title=configuration.format_titles
    :populate=populate
    :format=format
    @selected=selected
    v-on="$listeners"
  />
</template>

<script>
import store from '@/store'

export default {
  props: {
    enabled: { type: Boolean },
    title: { type: Boolean },
    populate: { type: Function },
    selected: { type: Function }
  },
  computed: {
    tome: function () {
      return store.state.tome
    },
    configuration: function () {
      return store.state.configuration
    }
  },
  methods: {
    format: function (name, directory) {
      const words = name.split('.')

      if (!directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          return ' - '
        }
      }

      return words.map(item => String(item).substring(0, 1).toUpperCase().concat(item.substring(1))).join(' ')
    }
  }
}
</script>
