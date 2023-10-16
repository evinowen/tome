import { Vue } from 'vue-facing-decorator'

export class FileIcon extends Vue {
  path: string
  extension: string
  relationship: string
  directory: boolean
  expanded: boolean
  selected: boolean
  image: boolean
  alert: boolean
  disabled: boolean
  size: string

  get system(): boolean
  get icon(): string
  get badge(): string
  get modifier(): string
}
