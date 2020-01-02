<template>
  <v-container class="pa-0">
    <v-container class="pa-0" @click.stop="select(null)" style="text-overflow: ellipsis; white-space: nowrap;">
      <v-icon class="mr-2" @click.stop="toggle">
        {{ expanded ? "mdi-folder-open" : "mdi-folder" }}
      </v-icon>
      {{ name }}
    </v-container>

    <v-container v-if="expanded"
      class="pa-1 pr-0 ml-1"
      style="border-left: 1px solid rgb(200, 200, 200);"
    >
      <explorer-node
        v-for="child in children"
        v-on:selected="select"
        :key=child.path
        :name=child.name
        :path=child.path
        :parent=this
        :directory=child.directory
        :populate=populate
      />
    </v-container>

  </v-container>
</template>

<script>
  export default {
    props: {
      name: { type: String, default: 'root' },
      path: { type: String },
      populate: { type: Function },
    },
    data: () => ({
      selected: null,
      directory: true,
      expanded: false,
      loaded: false,
      children: [],
    }),
    methods: {
      toggle: async function(event) {
        if (this.expanded) {
          this.$emit('collapsing', this)
          this.expanded = false;
          this.$emit('collapsed', this)

        } else {
          this.$emit('expanding', this)
          console.log('expanding', this.loaded, this.populate)

          if (!this.loaded && this.populate) {
            await this.load();

          }

          this.loaded = false;

          this.expanded = true;
          this.$emit('expanded', this)

        }
      },
      load: async function() {
        this.loaded = false;

        while (this.children.pop());

        console.log('await populate ... ');
        this.loaded = (await this.populate(this)) == true;
        console.log('done populate!');

        if (!this.loaded) {
          console.error(`Failed to load ${this.path}`);

        }

      },
      select:  function(node) {
        this.selected = node || this;
        console.log('explorer-folder', this.selected);
        return this.$emit('selected', this.selected);

      },
    }
  }
</script>