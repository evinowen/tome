import { Vue } from 'vue-facing-decorator'

export class Push extends Vue {
  value: string
  items: any[]

  edit: boolean
  form: { name: string, url: string }

  create(): Promise<void>
  input(remote): Promise<void>
}
