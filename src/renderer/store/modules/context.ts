import { defineStore } from 'pinia'
import ContextMenu from '@/objects/context/ContextMenu'

export interface State {
  visible: boolean
  stage?: () => Promise<ContextMenu>
  menu?: ContextMenu
  position: { x: number, y: number }
}

export const StateDefaults = (): State => ({
  visible: false,
  stage: undefined,
  menu: undefined,
  position: {
    x: 0,
    y: 0,
  },
})

export const fetch_context_store = defineStore('context', {
  state: StateDefaults,
  actions: {
    set: async function (stage) {
      this.stage = stage
    },
    load: async function () {
      if (this.stage !== undefined) {
        this.menu = await this.stage()
        this.visible = false
      }
    },
    open: async function (state) {
      const { position } = state || {}

      await this.load()
      this.position.x = position?.x || 0
      this.position.y = position?.y || 0
      this.visible = true
    },
    close: async function () {
      this.visible = false
    },
  },
})
