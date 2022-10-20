import Vue from 'vue'

export class KeyfileOutputProperties extends Vue {
  value: string
  small: boolean
  label: string
}

export default class KeyfileOutput extends KeyfileOutputProperties {
  copy(): Promise<void>
}