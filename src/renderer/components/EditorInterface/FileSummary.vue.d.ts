import { Vue } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State } from '@/store'

export declare class FileSummary extends Vue {
    store: Store<State>
    file: any

    get active(): boolean
    get key(): string

    select(): void
}
