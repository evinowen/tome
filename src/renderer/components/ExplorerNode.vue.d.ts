import Vue from 'vue'

export const ExplorerNodeGhostType: Record<string, string>

export class ExplorerNodeProperties extends Vue {
  uuid: string
  enabled: boolean
  expanded: boolean
  ephemeral: boolean
  title: boolean
  name: string
  path: string
  extension: string
  image: boolean
  relationship: string
  active: string
  edit: boolean
  format?: any
  directory: boolean
  children: any[]
  root: boolean
  depth: number
}

export default class ExplorerNode extends ExplorerNodeProperties {
  valid: boolean
  input: string
  error: any

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
