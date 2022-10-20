import Vue from 'vue'

export class ConsoleProperties extends Vue {
  value: boolean
}

export default class Console extends ConsoleProperties {
  detail: boolean
  stack: string

  get events(): any[]

  close(): Promise<void>
  show_stack(stack)
  format_date(datetime): string
  format_message(message): string
}
