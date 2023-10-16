import { Vue } from 'vue-facing-decorator'

export class PushPassphraseInput extends Vue {
  value: string
  storable: boolean
  stored: string

  obscured: boolean
}
