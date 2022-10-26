import Vue from 'vue'

export class RepositoryButtonProperties extends Vue {
  name: string
  path: string
  readme: string
  authors: string
  contributors: string
  license: string
  disabled: boolean
}

export default class RepositoryButton extends RepositoryButtonProperties {
  value: boolean

  open(path): Promise<void>
}
