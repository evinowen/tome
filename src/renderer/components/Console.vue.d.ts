import { Vue } from 'vue-facing-decorator'
import { DateTime } from 'luxon'

export class Console extends Vue {
  value: boolean
  detail: boolean
  stack: string

  get events(): { type: string, message: string, stack: string, datetime: DateTime }[]

  close(): Promise<void>
  show_stack(stack)
  format_date(datetime): string
  format_message(message): string
}
