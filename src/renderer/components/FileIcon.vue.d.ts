import Vue from 'vue'

export class FileIconProperties extends Vue {
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
}

export default class FileIcon extends FileIconProperties {
  get system(): boolean
  get icon(): string
  get badge(): string
  get modifier(): string
}
