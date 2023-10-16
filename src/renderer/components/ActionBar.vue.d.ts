import { Vue } from 'vue-facing-decorator'

export class ActionBar extends Vue {
  library: false

  get system(): any
  get repository(): any
  get status(): any
  get message(): string
  get disabled(): boolean

  open(path): Promise<void>
  close(): Promise<void>
  edit(): Promise<void>
  branch(): Promise<void>
  commit(): Promise<void>
  push(): Promise<void>
  console(): Promise<void>
  search(): Promise<void>

  disabled_unless (unless?): boolean
}
