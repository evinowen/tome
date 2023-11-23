import { Vue } from 'vue-facing-decorator'
import { File } from '@/store'

export declare class DirectoryView extends Vue {
    file: File

    get active(): boolean
    get key(): string

    select(): void
}
