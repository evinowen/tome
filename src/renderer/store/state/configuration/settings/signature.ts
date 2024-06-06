export interface State {
  name: string
  email: string
}

export default (): State => ({
  name: '',
  email: '',
})
