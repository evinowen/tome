import { Vue } from 'vue-facing-decorator'

export class Push extends Vue {
  get system(): any
  get repository(): any
  get configuration(): any

  close(): Promise<void>
  credential_key(value): Promise<void>
  credential_passphrase(value): Promise<void>
  confirm(value): Promise<void>
  add_remote(name, url): Promise<void>
  select_remote(name): Promise<void>
  diff(commit): Promise<void>
  push(): Promise<void>
}
