import { createLocalVue, mount } from '@vue/test-utils'

const respond = (routable) => {
  const _routable = routable || []
  const _mock = jest.fn(async (type, callback) => {
    if (_routable.includes(type)) {
      await callback()
    }
  })

  return { routable: _routable, mock: _mock }
}

const assemble = (object, default_properties, default_listeners) => {
  const factory = {
    trap: false,
    component: {
      context: undefined,
      hook: undefined
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

    return factory
  }

  factory.wrap = (properties, listeners) => {
    if (!factory.trap) {
      factory.make()
    }

    factory.localVue = createLocalVue()

    if (factory.component.hook) {
      factory.component.hook(factory)
    }

    factory.trap = false

    return mount(
      object,
      {
        localVue: factory.localVue,
        ...factory.context,
        propsData: {
          ...default_properties,
          ...properties
        },
        listeners: {
          ...default_listeners,
          ...listeners
        }
      }
    )
  }

  return factory
}

export {
  respond,
  assemble
}
