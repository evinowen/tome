import { Vue } from 'vue-property-decorator'
import { DebouncedFunc } from 'lodash'

export class SearchServiceProperties extends Vue {}

export default class SearchService extends SearchServiceProperties {
  get status(): string
  get results(): any[]
  get navigation(): { target: number, total: number }
  get query(): string
  get multifile(): boolean
  get regex_query(): boolean
  get case_sensitive(): boolean
  get state(): boolean[]
  get debounce_update(): DebouncedFunc<() => Promise<void>>

  state_update(): void
  update(query): Promise<void>
  next(): Promise<void>
  previous(): Promise<void>
  flag(key, value): Promise<void>
  select(path:string, target?: number, total?: number): Promise<void>
  debounce_clear(): Promise<void>
}
