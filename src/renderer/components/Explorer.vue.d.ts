import Vue from 'vue'

export class ExplorerProperties extends Vue {
  value: any
  enabled: boolean
}

export default class Explorer extends ExplorerProperties {
  hold?: { path: string }

  get repository(): any
  get configuration(): any
  get active(): string|undefined
  get editing(): any
  get root(): any|undefined

  format(name, directory?): string
  toggle(state): Promise<void>
  select(state): Promise<void>
  open(state): Promise<void>
  edit(state): Promise<void>
  create(state): Promise<void>
  delete(path): Promise<void>
  submit(state): Promise<void>
  blur(): Promise<void>
  drag(state): Promise<void>
  drop(state): Promise<void>
  template(state): Promise<void>
  action(state): Promise<void>
}
