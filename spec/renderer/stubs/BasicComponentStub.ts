export default {
  template: '<div><slot name="prepend" /><slot /><slot name="append" /></div>',
  props: {
    disabled: { type: Boolean, default: false },
  },
}
