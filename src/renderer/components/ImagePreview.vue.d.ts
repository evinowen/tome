import Vue from 'vue'

export class ImagePreviewProperties extends Vue {
  src: string
}

export default class ImagePreview extends ImagePreviewProperties {
  $refs: {
    preview: HTMLElement
  }

  hide: boolean
  zoom: boolean

  error()
  click(event): Promise<void>
}
