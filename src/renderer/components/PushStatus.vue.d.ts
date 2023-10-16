import { Vue } from 'vue-facing-decorator'

export class PushStatus extends Vue {
  active: boolean
  loading: boolean
  match: boolean
  error: string
  history: any[]

  headers: { text: string, value: string, width: string }[]
}
