import Vue from 'vue'

export class PushConfirmProperties extends Vue {
  value: boolean
  disabled: boolean
  waiting: boolean
  history: any[]
}

export default class PushConfirm extends PushConfirmProperties {
  headers: { text: string, value: string, width: string }[]
}
