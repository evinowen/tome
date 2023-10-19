import { Vue } from 'vue-facing-decorator'

export class RepositoryButton extends Vue {
  name: string
  path: string
  readme: string
  authors: string
  contributors: string
  license: string
  disabled: boolean

  value: boolean

  open(path): Promise<void>
}
