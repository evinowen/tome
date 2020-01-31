<template>
  <v-container class="pa-0" style="user-select: none;">
    <template v-if="directory">
      <v-container v-if="disabled" class="explorer-node explorer-node-disabled">
        <div class="explorer-node">
          <v-icon class="mr-1">mdi-folder</v-icon>
          {{ name }}
        </div>
      </v-container>
      <explorer
        v-else
        :name=name
        :path=path
        :populate=populate
        :new_file=new_file
        :new_folder=new_folder
        :open_folder=open_folder
        v-on:selected="select"
        :active=active child
      />
    </template>

    <template v-else>
      <v-container
        v-bind:class="['explorer-node', 'explorer-node-hover', {'explorer-node-selected': path == active }]"
        @click.stop="select(null)"
      >
        <div class="explorer-node">
          <v-btn tile text x-small @click.stop="select(null)" class="explorer-node-button mr-1">
            <v-icon>mdi-file</v-icon>
          </v-btn>
          {{ name }}
        </div>
      </v-container>

    </template>
  </v-container>

</template>

<style>
.explorer-node {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  padding: 0 !important;
  vertical-align: text-bottom;

}

.explorer-node-button {
  min-width: 20px !important;
  padding: 0 !important;

}

.explorer-node-disabled,
.explorer-node-disabled .v-icon {
  color: rgba(0, 0, 0, 0.20);
}

.explorer-node-hover:hover {
  background: #BBBBBB;

}

.explorer-node-selected {
  background: #F44336 !important;

}

</style>

<script>
  export default {
    props: {
      name: { type: String, default: '' },
      path: { type: String, default: '' },
      active: { type: String },
      populate: { type: Function },
      new_file: { type: Function },
      new_folder: { type: Function },
      open_folder: { type: Function },
      highlight: { type: String, default: '' },
      directory: { type: Boolean, default: false },
      parent: { type: Object },
    },
    data: () => ({
      expanded: false,
      loaded: false,
      children: [],
    }),
    computed: {
      disabled: function() {
        return [
          '.git'
        ].indexOf(this.name) > -1;
      },
    },
    methods: {
      select:  function(node) {
        let selected = node || this;
        console.log('explorer-node', selected);
        return this.$emit('selected', selected);

      },
    },
  }
</script>