import { Vue } from 'vue-facing-decorator'

export class KeyfileOutput extends Vue {
  value: string
  small: boolean
  label: string

  copy(): Promise<void>
}