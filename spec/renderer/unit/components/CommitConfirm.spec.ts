import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import CommitConfirm, { CommitConfirmMessages } from '@/components/CommitConfirm.vue'

describe('components/CommitConfirm', () => {
  let vuetify

  const factory = assemble(CommitConfirm)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set status to ready message when staging is false', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as CommitConfirm
    await wrapper.setProps({ staging: false })

    expect(local.status).toEqual(CommitConfirmMessages.Ready)
  })

  it('should set status to staging message when staging is true', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as CommitConfirm
    await wrapper.setProps({ staging: true })

    expect(local.status).toEqual(CommitConfirmMessages.Staging)
  })
})
