import Vue from 'vue'
import Component from 'vue-class-component'
import { VIcon, VBtn, VTextField, VLayout, VFlex } from 'vuetify/lib'

export class KeyfileInputProperties extends Vue {
  value: string
  forge: boolean
  storable: boolean
  stored: string
  small: boolean
  label: string
  id: string
}

export default class KeyfileInput extends KeyfileInputProperties {
  $refs: {
    input: HTMLInputElement
  }

  get color(): string

  input(event): Promise<void>
}
