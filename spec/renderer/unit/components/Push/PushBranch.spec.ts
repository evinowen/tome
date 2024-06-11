import { it, expect } from 'vitest'
import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import PushBranch from '@/components/Push/PushBranch.vue'

Component('components/Push/PushBranch', PushBranch)
  .stub({
    VCard: BasicComponentStub,
    VCardText: BasicComponentStub,
  })
  .run(async (factory) => {
    it('should mount into test scafolding without error', async () => {
      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
    })

    it('should use blank value for reference while no flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.reference).toEqual('')
    })

    it('should use blank value branch name for name while no flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.name).toEqual('')
    })

    it('should set loading false while no flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.loading).toEqual(false)
    })

    it('should set disabled false while no flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.disabled).toEqual(false)
    })
  })

Component('components/Push/PushBranch (Local)', PushBranch, { local: true })
  .stub({
    VCard: BasicComponentStub,
    VCardText: BasicComponentStub,
  })
  .store({
    'repository-branches': {
      active: 'local-branch',
    },
  })
  .run(async (factory) => {
    it('should mount into test scafolding without error', async () => {
      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
    })

    it('should use blank value for reference while local flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.reference).toEqual('')
    })

    it('should use active local branch name for name while local flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.name).toEqual('local-branch')
    })

    it('should set loading false while local flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.loading).toEqual(false)
    })

    it('should set disabled false while local flag is true', async () => {
      const wrapper = factory.wrap()
      expect(wrapper.vm.disabled).toEqual(false)
    })
  })

Component('components/Push/PushBranch (Remote)', PushBranch, { remote: true })
  .stub({
    VCard: BasicComponentStub,
    VCardText: BasicComponentStub,
  })
  .store({
    'repository-remotes': {
      active: {
        branch: {
          name: 'remote-reference',
          short: 'remote-branch',
        },
      },
    },
  })
  .run(async (factory) => {
    it('should mount into test scafolding without error', async () => {
      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
    })

    it('should use active remote branch reference for reference while remote flag is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      expect(repository_remotes.active.branch.name).toEqual('remote-reference')

      const wrapper = factory.wrap()
      expect(wrapper.vm.reference).toEqual('remote-reference')
    })

    it('should use active remote branch name for name while remote flag is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      expect(repository_remotes.active.branch.short).toEqual('remote-branch')

      const wrapper = factory.wrap()
      expect(wrapper.vm.name).toEqual('remote-branch')
    })

    it('should set loading false when remotes process select flag is false while remote flag is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      expect(repository_remotes.process.select).toEqual(false)

      const wrapper = factory.wrap()
      expect(wrapper.vm.loading).toEqual(false)
    })

    it('should set loading true when remotes process select flag is true while remote flag is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = true
      expect(repository_remotes.process.select).toEqual(true)

      const wrapper = factory.wrap()
      expect(wrapper.vm.loading).toEqual(true)
    })

    it('should set disabled false when active remote branch reference has value while remote flag is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      expect(repository_remotes.active.branch.name).toEqual('remote-reference')

      const wrapper = factory.wrap()
      expect(wrapper.vm.disabled).toEqual(false)
    })

    it('should set disabled true when active remote branch reference is blank while remote flag is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.active.branch.name = ''
      expect(repository_remotes.active.branch.name).toEqual('')

      const wrapper = factory.wrap()
      expect(wrapper.vm.disabled).toEqual(true)
    })
  })
