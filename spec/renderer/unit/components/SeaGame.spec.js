import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import SeaGame from '@/components/SeaGame'

describe('components/SeaGame', () => {
  let vuetify

  const factory = assemble(SeaGame)
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
