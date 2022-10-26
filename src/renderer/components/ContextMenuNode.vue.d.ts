import Vue from 'vue'
import ResizeObserver from 'resize-observer-polyfill'

export class ContextMenuNodeProperties extends Vue {
  title?: string
  root: boolean
  target?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  position_x: number
  position_y: number
  flip_x?: boolean
  flip_y?: boolean
  window_x: number
  window_y: number
  layer: number
}

export default class ContextMenuNode extends ContextMenuNodeProperties {
  $refs: {
    node: HTMLElement
  }

  active: number
  promoted: number
  width: number
  height: number
  local_position_x: number
  local_position_y: number
  local_flip_x: boolean
  local_flip_y: boolean
  resize_observer?: ResizeObserver

  position_x_update()
  position_y_update()
  flip_x_update()
  flip_y_update()
  mounted()
  resize()
  include(): Element[]
  offset(target): number
  reposition()
  activate(index)
  deactivate(index)
  promote(index): Promise<void>
  execute(action): Promise<void>
}
