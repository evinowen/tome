import Vue from 'vue'

export class PushStatusProperties extends Vue {
  active: boolean
  loading: boolean
  match: boolean
  error: string
  history: any[]
}

export default class PushStatus extends PushStatusProperties {
  headers: { text: string, value: string, width: string }[]
}
