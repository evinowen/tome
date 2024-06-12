import { expect } from 'vitest'
import { mount } from '@vue/test-utils'

// eslint-disable-next-line unicorn/prevent-abbreviations
export async function ClickElementRef<T> (wrapper: ReturnType<typeof mount<T>>, ref: string) {
  const element = wrapper.find({ ref })
  expect(element.exists()).toBe(true)

  await element.trigger('click')
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export async function ClickComponentRef<T> (wrapper: ReturnType<typeof mount<T>>, ref: string) {
  const element = wrapper.findComponent({ ref })
  expect(element.exists()).toBe(true)

  await element.trigger('click')
}
