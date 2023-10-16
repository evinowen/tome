import { Vue } from 'vue-facing-decorator'

export class SystemBar extends Vue {
  get maximized(): boolean
  get icon(): string
  get title(): string

  settings(): Promise<void>
  minimize(): Promise<void>
  maximize(): Promise<void>
  exit(): Promise<void>
}
