import { Vue } from 'vue-facing-decorator'

export class StatusButton extends Vue {
  waiting: number
  waiting_max: number
  available_new: number
  available_renamed: number
  available_modified: number
  available_removed: number
  staged_new: number
  staged_renamed: number
  staged_modified: number
  staged_removed: number

  get available_added(): number
  get staged_added(): number
}
