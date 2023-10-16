import { Vue } from 'vue-facing-decorator'
import { DebouncedFunc } from 'lodash'

export class Settings extends Vue {
  value: boolean

  obscure_passphrase: boolean
  version?: string
  process?: {
    versions?: Record<string, string>
    sandboxed: boolean
  }

  get configuration(): any
  get system(): any
  get debounce_save(): DebouncedFunc<() => Promise<void>>

  close(): Promise<void>
  assign_value(name, value): Promise<void>
  generate_key(passphrase): Promise<void>
  save(): Promise<void>
}
