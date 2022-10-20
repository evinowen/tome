import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import ImagePreview from '@/components/ImagePreview.vue'

describe('components/ImagePreview', () => {
  let vuetify

  const factory = assemble(ImagePreview)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should set hide to true when error is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ImagePreview

    expect(local.hide).toBe(false)

    await local.error()

    expect(local.hide).toBe(true)
  })
})
