<template>
  <div>
    <v-menu
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :position-x="position_x"
      :position-y="position_y"
    >
      <v-list>
        <v-subheader v-if=title>{{ title }}</v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            @click="item.action"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>

  </div>
</template>

<style>
</style>

<script>
  import { remote } from 'electron';

  export default {
    props: {
      value: { type: Boolean, default: false },
      title: { type: String, default: null },
      items: { type: Array },
      position_x: { type: Number, default: 0 },
      position_y: { type: Number, default: 0 },

    },

  }

</script>

