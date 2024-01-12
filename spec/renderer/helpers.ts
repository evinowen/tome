import Vue from 'vue'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'

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
  properties: { [key: string]: any }
  listeners: Record<string, Function|Function[]>
}

interface FactoryComponent<T> {
  context?: FactoryComponentContextMethod
  hook?: FactoryComponentHookMethod<T>
}

interface FactoryGenerated {
  vue?: typeof Vue
  context?: Record<string, any>
}

class Factory<T> {
  base: FactoryBase<T>
  component: FactoryComponent<T>
  generated: FactoryGenerated

  constructor (component: T, properties: { [key: string]: any } = {}, listeners: Record<string, Function|Function[]> = {}) {
    this.base = { component, properties, listeners }
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

  wrap(properties: Record<string, any> = {}, listeners: Record<string, Function|Function[]> = {}) {
    if (this.component.context) {
      this.generated.context = this.component.context()
    }

    if (this.component.hook) {
      this.component.hook(this)
    }

    return mount<T>(
      this.base.component,
      {
        ...this.generated.context,
        props: {
          ...this.base.properties,
          ...properties
        } as any,
        listeners: {
          ...this.base.listeners,
          ...listeners
        } as any,
      }
    )
  }
}

const assemble = <T>(component: T, default_properties: Record<string, any> = {}, default_listeners: Record<string, Function|Function[]> = {}) => {
  return new Factory<T>(component, default_properties, default_listeners)
}

export {
  respond,
  assemble
}
