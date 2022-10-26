import Vue from 'vue'

export class PushProperties extends Vue {
  value: string
  items: any[]
}

export default class Push extends PushProperties {
  edit: boolean
  form: { name: string, url: string }

  create(): Promise<void>
  input(remote): Promise<void>
}
