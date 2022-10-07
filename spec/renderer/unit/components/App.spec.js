import { assemble } from '?/helpers'
import Vuetify from 'vuetify'

import App from '@/components/App'

describe('components/App', () => {
  let vuetify

  const factory = assemble(App)
    .context(() => ({
      vuetify,
      stubs: {
        SystemBar: true,
        Settings: true,
        Branch: true,
        Patch: true,
        Commit: true,
        Push: true,
        Console: true,
        EditorInterface: true,
        EmptyPane: true,
        ActionBar: true,
        ContextMenuService: true,
        SearchService: true,
        ShortcutService: true
      }
    }))

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