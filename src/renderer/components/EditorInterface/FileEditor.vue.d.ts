import { Vue } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State } from '@/store'
import { Compartment, Extension } from '@codemirror/state'
import { SearchCursor, RegExpCursor } from '@codemirror/search'
import { Decoration, EditorView } from '@codemirror/view'

export declare class FileEditor extends Vue {
    $refs: {
        root: HTMLElement
    }

    store: Store<State>

    compartment: {
        language: Compartment
        line_numbers: Compartment
        tabs: Compartment
        theme: Compartment
        search: Compartment
        search_target: Compartment
    }

    search_decoration: Decoration
    search_decoration_target: Decoration
    theme_light_mode: Extension
    theme_dark_mode: Extension

    enabled: boolean

    updated: number
    file: any

    view?: EditorView

    get key(): string
    get line_numbers(): boolean
    get dark_mode(): boolean
    get search(): any
    get search_state(): any[]

    configure_line_numbers(): void
    configure_dark_mode(): void
    select(): void

    get actions(): any
    get context(): any[]

    contextmenu(event: any): Promise<void>
    mounted(): void
    selection_fetch(): string
    selection_replace(value: any): void
    search_cursor(text: any, from: any, to: any): SearchCursor | RegExpCursor
    search_mark(): Promise<void>
    search_navigate(): Promise<void>
    input(): Promise<void>

    get debounce_save(): (path: any) => Promise<void>
    save(path: any): Promise<void>
}
