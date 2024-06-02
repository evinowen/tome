export interface State {
  font_family_header: string
  font_family_content: string
  font_size_header: number
  font_size_content: number
  background: string
  header_1: string
  header_2: string
  header_3: string
  header_4: string
  header_5: string
  header_6: string
  content: string
  anchor: string
  selection: string
  highlight: string
  highlight_focus: string
}

export default (): State => ({
  font_family_header: '',
  font_family_content: '',
  font_size_header: 1,
  font_size_content: 1,
  background: '',
  header_1: '',
  header_2: '',
  header_3: '',
  header_4: '',
  header_5: '',
  header_6: '',
  content: '',
  anchor: '',
  selection: '',
  highlight: '',
  highlight_focus: '',
})
