import { it, expect } from 'vitest'
import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import PushStatus from '@/components/Push/PushStatus.vue'

Component('components/Push/PushStatus', PushStatus)
  .stub({
    VAvatar: BasicComponentStub,
    VCard: BasicComponentStub,
    VCardText: BasicComponentStub,
    VBtn: BasicComponentStub,
    VIcon: BasicComponentStub,
    VList: BasicComponentStub,
    VListItem: BasicComponentStub,
    VListItemTitle: BasicComponentStub,
    VListItemSubtitle: BasicComponentStub,
  })
  .run(async (factory) => {
    it('should mount into test scafolding without error', async () => {
      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
    })

    it('should flag active false if repository_remotes.process.select is false and repository_remotes.selected has no value', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = ''

      const wrapper = factory.wrap()
      expect(wrapper.vm.active).toEqual(false)
    })

    it('should flag active if repository_remotes.process.select is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = true
      repository_remotes.selected = ''

      const wrapper = factory.wrap()
      expect(wrapper.vm.active).toEqual(true)
    })

    it('should flag active if repository_remotes.selected has a value', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = 'remote-branch'

      const wrapper = factory.wrap()
      expect(wrapper.vm.active).toEqual(true)
    })

    it('should display content blank if inactive', async () => {
      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()

      const content_blank = wrapper.findComponent({ ref: 'blank-view' })
      expect(content_blank.exists()).toBe(true)

      const content_loading = wrapper.findComponent({ ref: 'loading-view' })
      expect(content_loading.exists()).toBe(false)

      const content_error = wrapper.findComponent({ ref: 'error-view' })
      expect(content_error.exists()).toBe(false)

      const content_match = wrapper.findComponent({ ref: 'match-view' })
      expect(content_match.exists()).toBe(false)

      const content_compare = wrapper.findComponent({ ref: 'compare-view' })
      expect(content_compare.exists()).toBe(false)
    })

    it('should flag loading false if repository_remotes.process.select is false', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false

      const wrapper = factory.wrap()
      expect(wrapper.vm.loading).toEqual(false)
    })

    it('should flag loading true if repository_remotes.process.select is true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = true

      const wrapper = factory.wrap()
      expect(wrapper.vm.loading).toEqual(true)
    })

    it('should display loading content if active and loading flags are true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = true

      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
      expect(wrapper.vm.active).toEqual(true)
      expect(wrapper.vm.loading).toEqual(true)

      const content_blank = wrapper.findComponent({ ref: 'blank-view' })
      expect(content_blank.exists()).toBe(false)

      const content_loading = wrapper.findComponent({ ref: 'loading-view' })
      expect(content_loading.exists()).toBe(true)

      const content_error = wrapper.findComponent({ ref: 'error-view' })
      expect(content_error.exists()).toBe(false)

      const content_match = wrapper.findComponent({ ref: 'match-view' })
      expect(content_match.exists()).toBe(false)

      const content_compare = wrapper.findComponent({ ref: 'compare-view' })
      expect(content_compare.exists()).toBe(false)
    })

    it('should display error content if active is true and error has value', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = 'remote-branch'
      repository_remotes.error = 'repository-remote-error'

      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
      expect(wrapper.vm.active).toEqual(true)
      expect(wrapper.vm.loading).toEqual(false)
      expect(wrapper.vm.error).toEqual('repository-remote-error')

      const content_blank = wrapper.findComponent({ ref: 'blank-view' })
      expect(content_blank.exists()).toBe(false)

      const content_loading = wrapper.findComponent({ ref: 'loading-view' })
      expect(content_loading.exists()).toBe(false)

      const content_error = wrapper.findComponent({ ref: 'error-view' })
      expect(content_error.exists()).toBe(true)

      const content_match = wrapper.findComponent({ ref: 'match-view' })
      expect(content_match.exists()).toBe(false)

      const content_compare = wrapper.findComponent({ ref: 'compare-view' })
      expect(content_compare.exists()).toBe(false)
    })

    it('should flag match true if repository_remotes.active.pending is empty', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = 'remote-branch'
      repository_remotes.active.pending = []

      const wrapper = factory.wrap()
      expect(wrapper.vm.match).toEqual(true)
    })

    it('should flag match false if repository_remotes.active.pending has content', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = 'remote-branch'
      repository_remotes.active.pending = [ {
        oid: '1234',
        date: new Date(),
        message: 'commit-message',
      } ]

      const wrapper = factory.wrap()
      expect(wrapper.vm.match).toEqual(false)
    })

    it('should display match content if active and match flags are true', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = 'remote-branch'
      repository_remotes.active.pending = []

      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
      expect(wrapper.vm.active).toEqual(true)
      expect(wrapper.vm.loading).toEqual(false)
      expect(wrapper.vm.match).toEqual(true)

      const content_blank = wrapper.findComponent({ ref: 'blank-view' })
      expect(content_blank.exists()).toBe(false)

      const content_loading = wrapper.findComponent({ ref: 'loading-view' })
      expect(content_loading.exists()).toBe(false)

      const content_error = wrapper.findComponent({ ref: 'error-view' })
      expect(content_error.exists()).toBe(false)

      const content_match = wrapper.findComponent({ ref: 'match-view' })
      expect(content_match.exists()).toBe(true)

      const content_compare = wrapper.findComponent({ ref: 'compare-view' })
      expect(content_compare.exists()).toBe(false)
    })

    it('should display compare content if active flag is true and match flag is false', async () => {
      const repository_remotes = fetch_repository_remotes_store()
      repository_remotes.process.select = false
      repository_remotes.selected = 'remote-branch'
      repository_remotes.active.pending = [ {
        oid: '1234',
        date: new Date(),
        message: 'commit-message',
      } ]

      const wrapper = factory.wrap()
      expect(wrapper).toBeDefined()
      expect(wrapper.vm.active).toEqual(true)
      expect(wrapper.vm.loading).toEqual(false)
      expect(wrapper.vm.match).toEqual(false)

      const content_blank = wrapper.findComponent({ ref: 'blank-view' })
      expect(content_blank.exists()).toBe(false)

      const content_loading = wrapper.findComponent({ ref: 'loading-view' })
      expect(content_loading.exists()).toBe(false)

      const content_error = wrapper.findComponent({ ref: 'error-view' })
      expect(content_error.exists()).toBe(false)

      const content_match = wrapper.findComponent({ ref: 'match-view' })
      expect(content_match.exists()).toBe(false)

      const content_compare = wrapper.findComponent({ ref: 'compare-view' })
      expect(content_compare.exists()).toBe(true)
    })

    it('should call repository_comparator.diff with provided OID when inspect is called', async () => {
      const repository_comparator = fetch_repository_comparator_store()

      const wrapper = factory.wrap()

      await wrapper.vm.inspect('1234')

      expect(repository_comparator.diff).toHaveBeenCalledWith({ commit: '1234' })
    })

    it('should repository_remotes.reselect when reselect is called', async () => {
      const repository_remotes = fetch_repository_remotes_store()

      const wrapper = factory.wrap()

      await wrapper.vm.reselect()

      expect(repository_remotes.reselect).toHaveBeenCalledWith()
    })
  })
