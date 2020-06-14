import { createLocalVue, mount } from '@vue/test-utils'

global.respond = (routable) => {
  const _routable = routable || []
  const _mock = jest.fn(async (type, callback) => {
    if (_routable.indexOf(type) < 0) {
      return
    }

    await callback()
  })

  return { routable: _routable, mock: _mock }
}

global.assemble = (object, defaults) => {
  const factory = {
    trap: false,
    component: {
      context: null,
      hook: null
    }
  }

  factory.context = (context) => {
    factory.component.context = context
    return factory
  }

  factory.hook = (hook) => {
    factory.component.hook = hook
    return factory
  }

  factory.make = () => {
    factory.trap = true

    if (factory.component.context) {
      factory.context = factory.component.context()
    }

    factory.localVue = createLocalVue()

    if (factory.component.hook) {
      factory.component.hook(factory)
    }

    return factory
  }

  factory.wrap = (props) => {
    if (!factory.trap) {
      factory.make()
    }

    factory.trap = false

    return mount(
      object,
      {
        localVue: factory.localVue,
        ...(factory.context || {}),
        propsData: {
          ...(defaults || {}),
          ...(props || {})
        }
      }
    )
  }

  return factory
}