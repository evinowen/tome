export interface State {
  font_family_compose: string
  font_size_compose: number
  background: string
  gutters: string
  line_numbers: string
  content: string
  comments: string
  anchor: string
  header_1: string
  header_2: string
  header_3: string
  header_4: string
  header_5: string
  header_6: string
  keywords: string
  operators: string
  types: string
  brackets: string
  strings: string
  numbers: string
  booleans: string
  selection: string
  highlight: string
  highlight_focus: string
}

export default (): State => ({
  font_family_compose: '',
  font_size_compose: 1,
  background: '',
  gutters: '',
  line_numbers: '',
  content: '',
  comments: '',
  anchor: '',
  header_1: '',
  header_2: '',
  header_3: '',
  header_4: '',
  header_5: '',
  header_6: '',
  keywords: '',
  operators: '',
  types: '',
  brackets: '',
  strings: '',
  numbers: '',
  booleans: '',
  selection: '',
  highlight: '',
  highlight_focus: '',
})
