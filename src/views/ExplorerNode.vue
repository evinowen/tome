<template>
  <v-container class="pa-0" @click.stop="select(null)" style="text-overflow: ellipsis; white-space: nowrap;">
    <template v-if="directory">
      <explorer :name=name :path=path :populate=populate v-on:selected="select"/>
    </template>

    <template v-else>
      <v-icon class="mr-2">mdi-file</v-icon>
      {{ name }}

    </template>
  </v-container>

</template>

<script>
  export default {
    props: {
      name: { type: String, default: '' },
      path: { type: String, default: '' },
      directory: { type: Boolean, default: false },
      populate: { type: Function },
      parent: { type: Object },
    },
    data: () => ({
      expanded: false,
      loaded: false,
      children: [],
    }),
    methods: {
      select:  function(node) {
        this.selected = node || this;
        console.log('explorer-node', this.selected);
        return this.$emit('selected', this.selected);

      },
    },
  }
</script>