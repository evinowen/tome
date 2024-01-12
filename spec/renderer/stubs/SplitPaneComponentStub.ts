export default {
  template: '<div><slot name="left" /><slot name="right" /></div>',
  props: {
    disabled: { type: Boolean, default: false },
  }
}