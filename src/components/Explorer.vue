<template>
  <explorer-node
    root
    :name=root.name
    :path=root.path
    :active=active
    :edit=editing
    :enabled=enabled
    :title=configuration.format_titles
    :format=format
    :hold=hold
    :children=root.children
    :expanded=root.expanded

    @context="$emit('context', $event)"
    @input="$emit('input', $event)"
    @paste="$emit('paste', $event)"

    @toggle=toggle
    @open=open
    @edit=edit
    @submit=submit
    @blur=blur
    @drag=drag
    @drop=drop
    @populate=populate
    @create=create

    ref="explorer_root"
  />
</template>

<script>
import store from '@/store'
import { remote, shell } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import ExplorerNode from './ExplorerNode.vue'

export default {
  props: {
    value: { type: Object },
    enabled: { type: Boolean }
  },
  data: () => ({
    editing: false,
    hold: null,
    root: {
      name: null,
      path: null,
      directory: true,
      populated: false,
      expanded: false,
      children: []
    }
  }),
  mounted: async function () {
    const fs = remote.require('fs')
    const path = remote.require('path')

    this.remote = { fs, path }

    this.root.name = this.tome.name
    this.root.path = this.tome.path
    this.root.expanded = true
  },
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
      const words = name ? String(name).split('.') : ['']

      if (words.length && !directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          return ' - '
        }
      }

      return words.map(item => String(item).substring(0, 1).toUpperCase().concat(item.substring(1))).join(' ').trim()
    },
    toggle: async function (state) {
      const { path } = state

      const { item } = this.identify(path)

      if (item) {
        item.expanded = !item.expanded
      }
    },
    open: async function (state) {
      const { target, parent } = state

      let path = target

      if (parent) {
        path = this.remote.path.dirname(target)
      }

      shell.openItem(path)
    },
    edit: async function () {
      this.editing = true
    },
    create: async function (state) {
      const { target, directory } = state

      const { item, parent, index } = this.identify(target)

      item.expanded = true

      this.editing = true

      const data = {
        uuid: uuidv4(),
        ephemeral: true,
        name: '',
        path: '',
        directory
      }

      if (item.directory) {
        item.children.push(data)
      } else {
        parent.children.splice(index, 0, data)
      }
    },
    delete: async function (path) {
      const { parent, index } = this.identify(path)

      this.$emit('delete', {
        path,
        reject: async (error) => error,
        resolve: async () => parent.children.splice(index, 1)
      })
    },
    submit: async function (state) {
      const { path, input, title } = state

      const { item } = this.identify(path)
      let name = input

      if (title) {
        name = name.toLowerCase().replace(/ +/g, '.')

        if (!item.directory) {
          name = name.concat('.md')
        }
      }

      const resolve = async (state) => {
        const { current } = state
        item.path = current.path
        await this.blur({ context: this })
        await this.refresh(current.parent)
      }

      const reject = async (error) => error

      if (item.ephemeral) {
        this.$emit('create', { path, name, resolve, reject })
      } else {
        this.$emit('rename', { path, name, resolve, reject })
      }
    },
    blur: async function (state) {
      const { context } = state

      if (context.ephemeral) {

      }

      this.editing = false
    },
    drag: async function (state) {
      this.hold = state
    },
    drop: async function (state) {
      this.$emit('move', this.hold.path, state.path, {
        reject: async (error) => error,
        resolve: async ({ previous, current }) => {
          this.refresh(previous.parent)

          if (previous.parent !== current.parent) {
            this.refresh(current.parent)
          }
        }
      })
    },
    identify: function (path) {
      if (String(path).indexOf(this.tome.path) !== 0) {
        return null
      }

      const path_relative = this.remote.path.relative(this.tome.path, path)

      const items = path_relative.split(this.remote.path.sep)

      const search = function (element, items) {
        const name = items.shift()

        if (name === '') {
          return { item: element }
        }

        const children = element.children
        const index = children.findIndex(child => child.name === name)

        if (index === -1) {
          throw new Error('Path could not be found in explorer')
        }

        if (items.length && items[0] !== '') {
          return search(children[index], items)
        }

        return { item: children[index], parent: element, index }
      }

      return search(this.root, items)
    },
    refresh: async function (path) {
      const { item } = this.identify(path)

      item.expanded = false
      item.populated = false

      await this.$nextTick()

      item.expanded = true
    },
    populate: async function (state) {
      const { path } = state

      const { item } = this.identify(path)

      await this.$emit('populate', item)

      item.children.sort((first, second) => {
        const name = (first, second) => {
          return first.path === second.path ? 0 : (first.path < second.path ? -1 : 1)
        }

        if (first.directory && second.directory) {
          return name(first, second)
        } else if (first.directory) {
          return -1
        } else if (second.directory) {
          return 1
        } else {
          return name(first, second)
        }
      })
    }
  },
  components: { ExplorerNode }
}
</script>
