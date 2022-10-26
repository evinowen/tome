import Vue from 'vue'

export class RepositoryPatch {
  static LineType: Record<string, number>
}

export class PatchProperties extends Vue {
  value: boolean
}

export default class Patch extends PatchProperties {
  get patches(): any

  close(): Promise<void>
  line_color(type): string
  line_prefix(type): string
}
