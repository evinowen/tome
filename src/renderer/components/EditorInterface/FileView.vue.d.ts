import { Vue } from 'vue-facing-decorator'
import { Store } from 'vuex'
import Mark from 'mark.js'
import { State } from '@/store'

export declare class FileView extends Vue {
    $refs: {
        root: HTMLElement
    }

    enabled: boolean
    store: Store<State>
    mark?: Mark
    target?: any
    results: Element[]
    file: any

    get active(): boolean
    get key(): string
    get search(): any
    get search_state(): any[]

    select(): void
    mounted(): void

    get actions(): any
    get context(): any[]

    contextmenu(event: any): Promise<void>

    get rendered(): string

    search_mark(): Promise<void>
    search_navigate(): Promise<void>
}
