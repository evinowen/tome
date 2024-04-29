import { HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

export default HighlightStyle.define([
  { tag: tags.content, color: 'rgb(var(--v-theme-compose-content }))' },
  { tag: tags.comment, color: 'rgb(var(--v-theme-compose-comments))' },
  { tag: tags.link, color: 'rgb(var(--v-theme-compose-anchor))', textDecoration: 'underline' },
  { tag: tags.heading1, color: 'rgb(var(--v-theme-compose-header_1))', textDecoration: 'underline' },
  { tag: tags.heading2, color: 'rgb(var(--v-theme-compose-header_2))', textDecoration: 'underline' },
  { tag: tags.heading3, color: 'rgb(var(--v-theme-compose-header_3))', textDecoration: 'underline' },
  { tag: tags.heading4, color: 'rgb(var(--v-theme-compose-header_4))', textDecoration: 'underline' },
  { tag: tags.heading5, color: 'rgb(var(--v-theme-compose-header_5))', textDecoration: 'underline' },
  { tag: tags.heading6, color: 'rgb(var(--v-theme-compose-header_6))', textDecoration: 'underline' },
  { tag: tags.keyword, color: 'rgb(var(--v-theme-compose-keywords))' },
  { tag: tags.operator, color: 'rgb(var(--v-theme-compose-operators))' },
  { tag: tags.typeName, color: 'rgb(var(--v-theme-compose-types))' },
  { tag: tags.bracket, color: 'rgb(var(--v-theme-compose-brackets))' },
  { tag: tags.string, color: 'rgb(var(--v-theme-compose-strings))' },
  { tag: tags.number, color: 'rgb(var(--v-theme-compose-numbers))' },
  { tag: tags.bool, color: 'rgb(var(--v-theme-compose-booleans))' },
])
