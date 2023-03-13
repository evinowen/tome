import Vue from 'vue'

export const ExplorerNodeGhostType: Record<string, string>

export class ExplorerNodeProperties extends Vue {
  uuid: string
  enabled: boolean
  title: boolean
  active: string
  edit: boolean
  format?: any
  root: boolean
  depth: number
}

export default class ExplorerNode extends ExplorerNodeProperties {
  valid: boolean
  input: string
  error?: string

  get file(): File
  get ephemeral(): boolean
  get name(): string
  get path(): string
  get extension(): string
  get image(): string
  get relationship(): string
  get children(): File[]
  get directory(): string
  get expanded(): boolean

  get selected(): boolean
  get locked(): boolean
  get system(): boolean
  get actions(): any[]
  get templates(): any[]
  get instance(): ExplorerNode
  get display(): string
  get visible(): boolean
  get rules(): ((value: string) => boolean|string)[]
  get alert(): boolean
  get context(): any[]

  contextmenu(event): Promise<void>
  drag_start(event)
  drag_end(event)
  drag_enter(event)
  drag_leave(event)
  drop(event)
  focus()
  submit()
}
