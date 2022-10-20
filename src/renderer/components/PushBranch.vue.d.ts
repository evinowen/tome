import Vue from 'vue'

export class PushBranchProperties extends Vue {
  name: string
  url: string
  loading: boolean
  disabled: boolean
}

export default class PushBranch extends PushBranchProperties {}
