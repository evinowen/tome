import { Vue } from 'vue-facing-decorator'
import { Store } from 'vuex'
import Mark from 'mark.js'
import { State, File } from '@/store'

export declare class TextView extends Vue {
    $refs: {
        root: HTMLElement
    }

    store: Store<State>
    mark?: Mark
    target?: any
    results: Element[]
    file?: File

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
