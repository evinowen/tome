import { Vue } from 'vue-facing-decorator'

export class SplitPane extends Vue {
  $refs: {
    resized: HTMLElement
  }

  resizing: boolean
  origin: number
  width: number

  resize_start(event): void
  resize_move(event): void
  resize_end(): void
}
