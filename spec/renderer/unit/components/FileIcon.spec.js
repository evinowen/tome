import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import FileIcon from '@/components/FileIcon.vue'

describe('FileIcon.vue', () => {
  let vuetify

  const factory = assemble(FileIcon)
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
})
