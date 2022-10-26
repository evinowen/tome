import Vue from 'vue'

export class RepositoryFile {
  static Type: Record<string, number>
}

export class CommitListProperties extends Vue {
  title: string
  items: any[]
  icon: string
  height: number
}

export default class CommitList extends CommitListProperties {
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
