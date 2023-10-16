import { Vue } from 'vue-facing-decorator'

export class ContextMenuService extends Vue {
  window_x: number
  window_y: number
  visible: boolean

  get context(): any[]

  resize()
  close(): Promise<void>
}
