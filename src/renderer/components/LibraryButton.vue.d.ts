import Vue from 'vue'

export class LibraryButtonProperties extends Vue {
  value: boolean
  disabled: boolean
}

export default class LibraryButton extends LibraryButtonProperties {
  get repository(): any
  get library(): any

  select(): Promise<void>
  open(item): Promise<void>
  close(): Promise<void>
}
