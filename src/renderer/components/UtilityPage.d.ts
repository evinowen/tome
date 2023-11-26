import { Vue } from 'vue-facing-decorator'

export declare class UtilityPage extends Vue {
    open: boolean

    left: boolean
    right: boolean
    bottom: boolean
    top: boolean

    get location(): "left" | "right" | "bottom" | "top"
}
