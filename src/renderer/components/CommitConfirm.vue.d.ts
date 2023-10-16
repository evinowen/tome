import { Vue } from 'vue-facing-decorator'

export const CommitConfirmMessages: {
  Staging: string
  Ready: string
}

export class CommitConfirm extends Vue {
  value: boolean
  name: string
  email: string
  message: string
  disabled: boolean
  staging: boolean
  waiting: boolean
  push: boolean

  get status(): string
}
