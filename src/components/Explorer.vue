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
    :hold=hold
    @submit=submit
    @blur=blur
    @drag=drag
    @drop=drop
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
    editing: false,
    hold: null
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

      return words.map(item => String(item).substring(0, 1).toUpperCase().concat(item.substring(1))).join(' ').trim()
    },
    edit: async function () {
      this.editing = true
      console.log('Explorer edit')
    },
    create: async function (path, directory) {
      this.value.create(path, directory)
      this.editing = true
      console.log('Explorer create')
    },
    submit: async function (state) {
      console.log('Explorer submit', state)
      const { context } = state

      let input = context.input

      if (context.title) {
        input = input.toLowerCase().replace(/ +/g, '.')

        if (!context.directory) {
          input = input.concat('.md')
        }
      }

      const resolve = async (update) => {
        context.parent.update(context, update)
        await this.blur({ context: this })
      }

      const reject = async (message) => {
        console.log(`Failed to create ${input}`, message)
        context.error = message
        context.$refs.form.validate()
      }

      if (context.ephemeral) {
        this.$emit('create', { context, input, resolve, reject })
      } else {
        this.$emit('rename', context.path, input, resolve)
      }
    },
    blur: async function (state) {
      const { context } = state

      if (context.ephemeral) {
        context.parent.remove_item(context)
      }

      this.editing = false
    },
    drag: async function (state) {
      this.hold = state
    },
    drop: async function (state) {
      this.$emit('move', this.hold.context.path, state.context.path, {
        reject: async (error) => {
          console.log(`Failed to move ${this.hold.context.path} to ${state.context.path}`, error)
        },
        resolve: async (path) => {
          const data = this.hold.context.parent.remove_item(this.hold.context)

          data.path = path || data.path

          if (state.context.directory) {
            if (!state.context.expanded) {
              await state.context.toggle()
            }

            state.context.insert_item(data)
          } else {
            state.context.parent.insert_item(data)
          }

          this.hold = null
        }
      })
    }
  }
}
</script>
