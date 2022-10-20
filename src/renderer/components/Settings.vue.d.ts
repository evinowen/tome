import Vue from 'vue'
import { DebouncedFunc } from 'lodash'

export class SettingsProperties extends Vue {
  value: boolean
}

export default class Settings extends SettingsProperties {
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
