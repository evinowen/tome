import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import CommitConfirm, { CommitConfirmMessages } from '@/components/CommitConfirm'

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
    await wrapper.setProps({ staging: false })

    expect(wrapper.vm.status).toEqual(CommitConfirmMessages.Ready)
  })

  it('should set status to staging message when staging is true', async () => {
    const wrapper = factory.wrap()
    await wrapper.setProps({ staging: true })

    expect(wrapper.vm.status).toEqual(CommitConfirmMessages.Staging)
  })
})
