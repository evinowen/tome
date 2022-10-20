import Vue from 'vue'

export const CommitConfirmMessages: {
  Staging: string
  Ready: string
}

export class CommitConfirmProperties extends Vue {
  value: boolean
  name: string
  email: string
  message: string
  disabled: boolean
  staging: boolean
  waiting: boolean
  push: boolean
}

export default class CommitConfirm extends CommitConfirmProperties {
  get status(): string
}
