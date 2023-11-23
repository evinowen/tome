import { Vue } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State } from '@/store'

export declare class EditorInterface extends Vue {
    static VIEW_EMPTY: string
    static VIEW_EDIT: string
    static VIEW_RENDER: string

    store: Store<State>
    selected: any

    get active(): any
    get system(): any
    get explore(): boolean
    get rendered(): boolean
    get view(): string
    get view_empty(): boolean
    get view_edit(): boolean
    get view_render(): boolean

    select(): void
}
