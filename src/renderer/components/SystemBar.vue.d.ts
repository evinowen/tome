import Vue from 'vue'

export class SystemBarProperties extends Vue {}

export default class SystemBar extends SystemBarProperties {
  get maximized(): boolean
  get icon(): string
  get title(): string

  settings(): Promise<void>
  minimize(): Promise<void>
  maximize(): Promise<void>
  exit(): Promise<void>
}
