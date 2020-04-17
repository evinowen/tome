<template>
  <explorer-directory
    :name=tome.name
    :path=tome.path
    :active=active
    :edit=editing
    :enabled=enabled
    :title=configuration.format_titles
    :populate=populate
    :format=format
    @submit=submit
    @blur=blur
    v-on="$listeners"
  />
</template>

<script>
import store from '@/store'

export default {
  props: {
    value: { type: Object },
    enabled: { type: Boolean },
    populate: { type: Function }
  },
  data: () => ({
    editing: false
  }),
  computed: {
    tome: function () {
      return store.state.tome
    },
    configuration: function () {
      return store.state.configuration
    },
    active: function () {
      return this.value ? this.value.path : ''
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
    },
    edit: async function () {
      this.editing = true
      console.log('Explorer edit')
    },
    submit: async function (data) {
      console.log('Explorer submit', data)
      await this.blur()

      let proposed = data.proposed

      if (data.title) {
        proposed = proposed.toLowerCase().replace(/ +/g, '.')

        if (!data.directory) {
          proposed = proposed.concat('.md')
        }
      }

      this.$emit('rename', data.path, proposed, (update) => { data.container.update(data.path, update) })
    },
    blur: async function () {
      console.log('Explorer blur')
      this.editing = false
    }
  }
}
</script>
