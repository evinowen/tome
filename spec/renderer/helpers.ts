import Vue from 'vue'
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


type FactoryComponentContextMethod = () => Record<string, unknown>
type FactoryComponentHookMethod = (factory: Factory) => void

interface FactoryBase {
  object: any
  properties: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/ban-types
  listeners: Record<string, Function|Function[]>
}

interface FactoryComponent {
  context?: FactoryComponentContextMethod
  hook?: FactoryComponentHookMethod
}

interface FactoryGenerated {
  vue?: typeof Vue
  context?: Record<string, unknown>
}

class Factory {
  base: FactoryBase
  component: FactoryComponent
  generated: FactoryGenerated

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor (object: any, properties: Record<string, unknown> = {}, listeners: Record<string, Function|Function[]> = {}) {
    this.base = { object, properties, listeners }
    this.component = {}
    this.generated = {}
  }

  context (context: FactoryComponentContextMethod) {
    this.component.context = context
    return this
  }

  hook (hook: FactoryComponentHookMethod) {
    this.component.hook = hook
    return this
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  wrap (properties?: Record<string, unknown>, listeners?: Record<string, Function|Function[]>) {
    if (this.component.context) {
      this.generated.context = this.component.context()
    }

    this.generated.vue = createLocalVue()

    if (this.component.hook) {
      this.component.hook(this)
    }

    return mount(
      this.base.object,
      {
        localVue: this.generated.vue,
        ...this.generated.context,
        propsData: {
          ...this.base.properties,
          ...properties
        },
        listeners: {
          ...this.base.listeners,
          ...listeners
        }
      }
    )
  }
}

const assemble = (object, default_properties = {}, default_listeners = {}) => {
  return new Factory(object, default_properties, default_listeners)
}

export {
  respond,
  assemble
}
