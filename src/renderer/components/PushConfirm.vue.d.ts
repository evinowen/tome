import { Vue } from 'vue-facing-decorator'

export class PushConfirm extends Vue {
  value: boolean
  disabled: boolean
  waiting: boolean
  history: any[]

  headers: { text: string, value: string, width: string }[]
}
