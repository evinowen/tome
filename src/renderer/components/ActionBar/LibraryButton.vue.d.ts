import { Vue } from 'vue-facing-decorator'

export class LibraryButton extends Vue {
  value: boolean
  disabled: boolean

  get repository(): any
  get library(): any

  select(): Promise<void>
  open(item): Promise<void>
  close(): Promise<void>
}
