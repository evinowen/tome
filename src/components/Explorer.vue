<template>
  <v-container class="pa-0" style="user-select: none;">
    <v-container class="explorer-folder"
      v-bind:class="['explorer-folder', {'explorer-folder-selected': path == (child ? active : upstream) }]"
      @click.stop="select(null)"
    >
      <v-row no-gutters align="end">
        <v-btn tile text x-small @click.stop="toggle" class="explorer-folder-button mr-1">
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <div style="display: inline-block;">{{ name }}</div>
        <div class="explorer-folder-options pr-5">
          <v-btn tile text x-small @click.stop="new_file(path)" class="explorer-folder-button">
            <v-icon>mdi-file-star</v-icon>
          </v-btn>
          <v-btn tile text x-small @click.stop="new_folder(path)" class="explorer-folder-button">
            <v-icon>mdi-folder-star</v-icon>
          </v-btn>
          <v-btn tile text x-small @click.stop="open_folder(path)" class="explorer-folder-button">
            <v-icon>mdi-folder-move</v-icon>
          </v-btn>
        </div>
      </v-row>
    </v-container>

    <v-container v-if="expanded" class="explorer-folder-container" >
      <template v-if=child>
        <explorer-node
          v-for="child in children"
          v-on:selected="select"
          :key=child.path
          :name=child.name
          :path=child.path
          :parent=this
          :directory=child.directory
          :populate=populate
          :new_file=new_file
          :new_folder=new_folder
          :open_folder=open_folder
          :active=active
        />
      </template>
      <template v-else>
        <explorer-node
          v-for="child in children"
          v-on:selected="select"
          :key=child.path
          :name=child.name
          :path=child.path
          :parent=this
          :directory=child.directory
          :populate=populate
          :new_file=new_file
          :new_folder=new_folder
          :open_folder=open_folder
          :active=upstream
        />
      </template>
    </v-container>

  </v-container>
</template>

<style>
.explorer-folder {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  padding: 0 !important;
  vertical-align: text-bottom;

}

.explorer-folder:hover {
  background: #BBBBBB;

}

.explorer-folder-button {
  min-width: 20px !important;
  padding: 0 !important;

}

.explorer-folder-selected {
  background: #F44336 !important;

}

.explorer-folder-options {
  display: inline-block;
  visibility: hidden;
  position: absolute;
  height: 100%;
  text-align: right;
  padding: 0;
  right: 0;

}

.explorer-folder-options .v-icon {
  color: rgba(0, 0, 0, 0.2) !important;

}

.explorer-folder-options .v-icon:hover {
  color: rgba(0, 0, 0, 0.6) !important;

}

.explorer-folder:hover .explorer-folder-options {
  visibility: visible;

}

.explorer-folder-container {
  border: solid #C8C8C8;
  border-width: 0 0 0 1px;
  width: auto !important;
  padding: 0 0 0 4px !important;
  margin: 0 0 4px 4px !important;

}

</style>

<script>
  export default {
    props: {
      name: { type: String, default: '' },
      path: { type: String },
      active: { type: String },
      populate: { type: Function },
      new_file: { type: Function },
      new_folder: { type: Function },
      open_folder: { type: Function },
      child: { type: Boolean }
    },
    data: () => ({
      selected: null,
      directory: true,
      expanded: false,
      loaded: false,
      children: [],
      upstream: '',
    }),
    computed: {
      icon: function() {
        if (this.child) {
          return this.expanded ? "mdi-folder-open" : "mdi-folder";

        }

        return this.expanded ? "mdi-book-open-page-variant" : "mdi-book";

      },
    },
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
        this.upstream = this.selected.path;
        return this.$emit('selected', this.selected);

      },
    }
  }
</script>