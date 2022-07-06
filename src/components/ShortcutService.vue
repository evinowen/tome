<template>
  <div>
    <div v-shortkey.once="['esc']" @shortkey=escape />
    <div v-shortkey.once="['ctrl', '`']" @shortkey="$emit('console')" />
    <div v-shortkey.once="['ctrl', 'e']" @shortkey="$emit('edit')" />
    <div v-shortkey.once="['ctrl', 's']" @shortkey="$emit('commit')" />
    <div v-shortkey.once="['ctrl', 'shift', 's']" @shortkey="$emit('quick-commit')" />
    <div v-shortkey.once="['ctrl', 'p']" @shortkey="$emit('push')" />
    <div v-shortkey.once="['ctrl', 'f']" @shortkey="$emit('search')" />
    <div v-shortkey.once="['ctrl', 'o']" @shortkey="$emit('open')" />
  </div>
</template>

<script>
export default {
  props: {
    settings: { type: Boolean, default: false },
    patch: { type: Boolean, default: false },
    search: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    branch: { type: Boolean, default: false },
    commit: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    console: { type: Boolean, default: false }
  },
  methods: {
    escape: function () {
      if (this.settings) {
        this.$emit('settings')
      } else if (this.console) {
        this.$emit('console')
      } else if (this.patch) {
        this.$emit('patch')
      } else if (this.search) {
        this.$emit('search')
      } else if (this.branch) {
        this.$emit('branch')
      } else if (this.push) {
        this.$emit('push')
      } else if (this.commit) {
        this.$emit('commit')
      } else if (this.edit) {
        this.$emit('edit')
      } else {
        this.$emit('settings')
      }
    }
  }
}

</script>
