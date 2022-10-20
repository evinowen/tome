/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { DebouncedFunc } from 'lodash'
import VueCodeMirror from 'vue-codemirror'

export class EditorInterfaceProperties extends Vue {}

export default class EditorInterface extends EditorInterfaceProperties {
  $refs: {
    editor: VueCodeMirror,
    rendered: HTMLElement
  }

  error: boolean
  overlay?: { token: any }
  mark?: any
  regex?: RegExp
  focus: Element
  mode: {
    read: {
      results: Element[]
    },
    write: {
      cursor: any,
      position: number
    }
  }

  get system(): any
  get codemirror(): any
  get explore(): boolean
  get edit (): boolean
  get active (): any
  get selected (): any
  get markdown (): boolean
  get html (): boolean
  get rendered (): string
  get directory (): boolean
  get readonly (): boolean
  get view (): string
  get query (): string
  get regex_query (): string
  get case_sensitive (): boolean
  get target (): any
  get actions (): any[]
  get codemirror_options (): { theme: string }

  get state (): (string|boolean)[]
  get debounce_save (): DebouncedFunc<() => Promise<void>>
  get context (): any[]

  active_update()
  edit_update(value)
  state_update()
  target_update()
  mounted()
  contextmenu(event): Promise<void>
  refresh(reset: boolean): Promise<void>
  input(): Promise<void>
  save(path): Promise<void>
  search(): Promise<void>
  navigate(): Promise<void>
}
