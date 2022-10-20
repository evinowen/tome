import Vue from 'vue'

export class ContextMenuServiceProperties extends Vue {}

export default class ContextMenuService extends ContextMenuServiceProperties {
  window_x: number
  window_y: number
  visible: boolean

  get context(): any[]

  resize()
  close(): Promise<void>
}
