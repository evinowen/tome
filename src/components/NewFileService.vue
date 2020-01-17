<template>
  <v-dialog v-model="active" persistent>
    <form @submit="create">
      <v-card>
        <v-card-title class="headline">{{ folder ? 'New Folder' : 'New File' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="label" :suffix="extension_formatted">
            <template v-slot:label>
              <v-icon>{{ folder ? 'mdi-folder' : 'mdi-file' }}</v-icon>
              {{ relative }}
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click.stop="$emit('close')">Cancel</v-btn>
          <v-btn color="green darken-1" text @click.stop="create">Create</v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </v-dialog>
</template>

<style>
</style>

<script>
  import { remote } from 'electron';

  const fs = remote.require('fs');
  const path = remote.require('path');

  export default {
    props: {
      active: { type: Boolean },
      target: { type: String, default: '' },
      base: { type: String, default: '' },
      extension: { type: String, default: '' },
      folder: { type: Boolean },
    },
    data: () => ({
      label: '',
    }),
    computed: {
      relative: function() {
        console.log(this.base, this.target);
        if (path.isAbsolute(this.target)) {
          return path.relative(this.base, this.target);
        }

        return this.target;

      },
      extension_formatted: function () {
        return String(this.extension ? (this.extension[0] == '.' ? '' : '.') : '').concat(this.extension || '');
      },
    },
    methods: {
      create: async function (data) {
        let file = path.join(this.base, this.relative, this.label);

        if (this.extension_formatted) {
          file = `${file}${this.extension_formatted}`;

        }

        console.log("[New File] Creating File", file);

        if (this.folder) {

          let err = await new Promise((resolve, reject) => fs.mkdir(file, { recursive: true }, (err) => err ? reject(err) : resolve(true)))

          if (err) {
            console.log("[New File] Failure to Create Folder", file);

          }

        } else {
          let fd = await new Promise((resolve, reject) => fs.open(file, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
          await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)));

        }

        this.$emit('create');
        this.$emit('close');

        this.label = '';

      },
    }
  }
</script>