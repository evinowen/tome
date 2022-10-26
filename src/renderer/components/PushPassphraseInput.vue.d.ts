import Vue from 'vue'

export class PushPassphraseInputProperties extends Vue {
  value: string
  storable: boolean
  stored: string
}

export default class PushPassphraseInput extends PushPassphraseInputProperties {
  obscured: boolean
}
