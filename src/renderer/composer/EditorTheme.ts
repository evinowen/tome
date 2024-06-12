import { EditorView } from '@codemirror/view'

export default EditorView.theme({
  '&': {
    fontFamily: 'var(--font-compose)',
    fontSize: 'var(--font-compose-size)',
    color: 'rgb(var(--v-theme-compose-content))',
    backgroundColor: 'rgb(var(--v-theme-compose-background))',
  },
  '.cm-content': {
    fontFamily: 'var(--font-compose)',
    caretColor: 'rgb(var(--v-theme-compose-content))',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'rgb(var(--v-theme-compose-content))',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgb(var(--v-theme-compose-selection))',
    outline: '2px solid rgb(var(--v-theme-compose-selection))',
    color: 'rgb(var(--v-theme-on-compose-selection))',
  },
  '.cm-gutters': {
    fontFamily: 'var(--font-compose)',
    backgroundColor: 'rgb(var(--v-theme-compose-gutters))',
    color: 'rgb(var(--v-theme-compose-line-numbers))',
    border: 'none',
  },
  '.highlight': {
    backgroundColor: 'rgb(var(--v-theme-compose-highlight))',
    outline: '2px solid rgb(var(--v-theme-compose-highlight))',
    color: 'rgb(var(--v-theme-on-compose-highlight))',
  },
  '.highlight-target': {
    backgroundColor: 'rgb(var(--v-theme-compose-highlight-focus))',
    outline: '2px solid rgb(var(--v-theme-compose-highlight-focus))',
    color: 'rgb(var(--v-theme-on-compose-highlight-focus))',
  },
})
