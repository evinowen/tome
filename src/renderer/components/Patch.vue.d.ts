import { Vue } from 'vue-facing-decorator'

export class RepositoryPatch {
  static LineType: Record<string, number>
}

export class Patch extends Vue {
  value: boolean

  get patches(): any

  close(): Promise<void>
  line_color(type): string
  line_prefix(type): string
}
