import { Vue } from 'vue-facing-decorator'

export class PushBranch extends Vue {
  name: string
  url: string
  loading: boolean
  disabled: boolean
}
