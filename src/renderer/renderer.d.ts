import { API } from '@/api'

declare global {
  interface Document {
    getSelection: () => Selection
  }
  interface Window {
    api: API
  }
}
