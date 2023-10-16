import { Vue } from 'vue-facing-decorator'

export class SeaGame extends Vue {
  $refs: {
    boat: HTMLElement,
    cannon_ball: HTMLElement,
    cannon_splash: HTMLElement,
    distance: HTMLElement,
    sea: HTMLElement
  }

  ticker?: number
  cannon: any

  mounted()
  unmounted()
  click(event): Promise<void>
  tick(): Promise<void>
  update(): Promise<void>
  update_cannon_ball(): Promise<void>
  update_splash(): Promise<void>
  update_distance(): Promise<void>
}
