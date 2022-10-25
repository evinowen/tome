import Vue from 'vue'
import { DateTime } from 'luxon'

export class ConsoleProperties extends Vue {
  value: boolean
}

export default class Console extends ConsoleProperties {
  detail: boolean
  stack: string

  get events(): { type: string, message: string, stack: string, datetime: DateTime }[]

  close(): Promise<void>
  show_stack(stack)
  format_date(datetime): string
  format_message(message): string
}
