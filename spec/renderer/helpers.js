import { createLocalVue, mount } from '@vue/test-utils'

const respond = (routable) => {
  const _routable = routable || []
  const _mock = jest.fn(async (type, callback) => {
    if (_routable.indexOf(type) < 0) {
      return
    }

    await callback()
  })

  return { routable: _routable, mock: _mock }
}

const assemble = (object, default_props, default_listeners) => {
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

    return factory
  }

  factory.wrap = (props, listeners) => {
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
        ...(factory.context || {}),
        propsData: {
          ...(default_props || {}),
          ...(props || {})
        },
        listeners: {
          ...(default_listeners || {}),
          ...(listeners || {})
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
