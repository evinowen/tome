import Vue from 'vue'
import { vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'

const respond = (routable) => {
  const _routable = routable || []
  const _mock = vi.fn(async (type, callback) => {
    if (_routable.includes(type)) {
      await callback()
    }
  })

  return { routable: _routable, mock: _mock }
}

type FactoryComponentContextMethod = () => Record<string, unknown>
type FactoryComponentHookMethod<T> = (factory: Factory<T>) => void

interface FactoryBase<T> {
  component: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: { [key: string]: any }
}

interface FactoryComponent<T> {
  context?: FactoryComponentContextMethod
  hook?: FactoryComponentHookMethod<T>
}

interface FactoryGenerated {
  vue?: typeof Vue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
}

export class Factory<T> {
  base: FactoryBase<T>
  component: FactoryComponent<T>
  generated: FactoryGenerated

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (component: T, properties: { [key: string]: any } = {}) {
    this.base = { component, properties }
    this.component = {}
    this.generated = {}
  }

  context (context: FactoryComponentContextMethod) {
    this.component.context = context
    return this
  }

  hook (hook: FactoryComponentHookMethod<T>) {
    this.component.hook = hook
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrap (properties: Record<string, any> = {}) {
    if (this.component.context) {
      this.generated.context = this.component.context()
    }

    if (this.component.hook) {
      this.component.hook(this)
    }

    return shallowMount<T>(
      this.base.component,
      {
        ...this.generated.context,
        props: {
          ...this.base.properties,
          ...properties,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      },
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assemble = <T>(component: T, default_properties: Record<string, any> = {}) => {
  return new Factory<T>(component, default_properties)
}

export {
  respond,
  assemble,
}
