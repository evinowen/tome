export default {
  template: '<div><slot name="activator" /><slot v-if="modelValue" /></div>',
  props: {
    modelValue: { type: Boolean, default: true },
  }
}