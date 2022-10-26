import Vue from 'vue'

export class BranchProperties extends Vue {
  value: boolean
}

export default class Branch extends BranchProperties {
  headers: { text: string, value: string, width: string }[]

  get repository(): any

  close(): Promise<void>
  diff(commit): Promise<void>
  format_date(date): string
  format_date_relative(date): string
}
