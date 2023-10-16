import { Vue } from 'vue-facing-decorator'

export class Branch extends Vue {
  value: boolean
  headers: { text: string, value: string, width: string }[]

  get repository(): any

  close(): Promise<void>
  diff(commit): Promise<void>
  format_date(date): string
  format_date_relative(date): string
}
