import { Vue } from 'vue-facing-decorator'

export class ImagePreview extends Vue {
  src: string

  $refs: {
    preview: HTMLElement
  }

  hide: boolean
  zoom: boolean

  error()
  click(event): Promise<void>
}
