import Vue from 'vue'

export class ShortcutServiceProperties extends Vue {}

export default class ShortcutService extends ShortcutServiceProperties {
  get system(): any

  escape(): Promise<void>
  layer(layer): Promise<boolean>
  perform(performance): Promise<void>
  select(): Promise<void>
}
