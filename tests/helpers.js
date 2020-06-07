import { createLocalVue, mount } from '@vue/test-utils'

global.factory = (object, prepare, defaults) => {
  const { context, use } = prepare()

  return (props) => {
    const localVue = createLocalVue()

    if (use && use.localVue) {
      for (item of use.localVue) {
        localVue.use(item)
      }
    }

    return mount(
      object,
      {
        localVue,
        ...(context || {}),
        propsData: {
          ...(defaults || {}),
          ...(props || {})
        }
      }
    )
  }

}
