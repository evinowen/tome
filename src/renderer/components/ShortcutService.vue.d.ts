import { Vue } from 'vue-facing-decorator'

export class ShortcutService extends Vue {
  get system(): any

  escape(): Promise<void>
  layer(layer): Promise<boolean>
  perform(performance): Promise<void>
  select(): Promise<void>
}
