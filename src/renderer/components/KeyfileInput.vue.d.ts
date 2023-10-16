import { Vue } from 'vue-facing-decorator'

export class KeyfileInput extends Vue {
  value: string
  forge: boolean
  storable: boolean
  stored: string
  small: boolean
  label: string
  id: string

  $refs: {
    input: HTMLInputElement
  }

  get color(): string

  input(event): Promise<void>
}
