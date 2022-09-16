import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import ImagePreview from '@/components/ImagePreview.vue'

describe('ImagePreview.vue', () => {
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

    expect(wrapper.vm.hide).toBe(false)

    await wrapper.vm.error()

    expect(wrapper.vm.hide).toBe(true)
  })
})
