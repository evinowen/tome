import { Vue } from 'vue-facing-decorator'

export class RepositoryFile {
  static Type: Record<string, number>
}

export class CommitList extends Vue {
  title: string
  items: any[]
  icon: string
  height: number

  datatable: {
    offset: number,
    height: number,
    min_height: number
  }

  headers: { text: string, value: string, width: string }[]

  resize()
  file_type(type): string
  file_color(type): string
  file_icon(type): string
}
