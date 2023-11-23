import { Vue } from 'vue-facing-decorator'
import { File } from '@/store'

export class ImageView extends Vue {
  file?: File

  $refs: {
    preview: HTMLElement
  }

  hide: boolean
  zoom: boolean

  error()
  click(event): Promise<void>
}
