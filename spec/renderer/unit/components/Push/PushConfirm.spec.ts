import { it, expect } from 'vitest'
import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { ClickComponentRef } from '?/helpers/click'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import PushConfirm from '@/components/Push/PushConfirm.vue'

Component('components/Push/PushConfirm', PushConfirm)
  .stub({
    OverlayBox: BasicComponentStub,
    VAvatar: BasicComponentStub,
    VBtn: BasicComponentStub,
    VCard: BasicComponentStub,
    VCardActions: BasicComponentStub,
    VIcon: BasicComponentStub,
    VListItem: BasicComponentStub,
    VListItemSubtitle: BasicComponentStub,
    VListItemTitle: BasicComponentStub,
    VProgressCircular: BasicComponentStub,
    VTextarea: BasicComponentStub,
  })
  .run(async (factory) => {
    it('should mount into test scafolding without error', async () => {
      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
    })

    it('should call repository_comparator.diff with provided OID when inspect is called', async () => {
      const repository_comparator = fetch_repository_comparator_store()

      const wrapper = factory.wrap()

      await wrapper.vm.inspect('1234')

      expect(repository_comparator.diff).toHaveBeenCalledWith({ commit: '1234' })
    })

    it('should dispatch system.perform with SystemPerformance.Push when push button emits "click" event', async () => {
      const system = fetch_system_store()

      const wrapper = factory.wrap()

      await ClickComponentRef<typeof PushConfirm>(wrapper, 'push-button')

      expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Push)
    })

    it('should dispatch system.page with push_confirm flag set false when return button emits "click" event', async () => {
      const system = fetch_system_store()

      const wrapper = factory.wrap()

      await ClickComponentRef<typeof PushConfirm>(wrapper, 'return-button')

      expect(system.page).toHaveBeenCalledWith({ push_confirm: false })
    })
  })
