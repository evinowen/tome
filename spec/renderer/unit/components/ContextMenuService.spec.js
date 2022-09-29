import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import ContextMenuService from '@/components/ContextMenuService'

describe('components/ContextMenuService', () => {
  let vuetify

  const factory = assemble(ContextMenuService)
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
