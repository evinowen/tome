import { defineStore } from 'pinia'
import File, { FileLoadContract } from '@/objects/File'
import FileTree, { FileIdentity, FileIdentityContract } from '@/objects/FileTree'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_repository_metadata_store } from '@/store/modules/repository/metadata'

export { default as File } from '@/objects/File'

class FileTreeNotEstablishedError extends Error {}
class FileNotSelectedError extends Error {}
class FileSubmitFailureError extends Error {}

export const ChokidarEvent = {
  ADD: 'add',
  ADD_DIR: 'addDir',
  DELETE: 'unlink',
  DELETE_DIR: 'unlinkDir',
}

export class State {
  path: string
  directory: { [key: string]: File } = {}
  active: string
  content: string
  ghost: string
  base: string
  selected: string
  held: string
  editing: boolean
  tree?: FileTree
  post?: (path: string) => void
}

export const StateDefaults = (): State => ({
  path: '',
  directory: {},
  active: '',
  content: '',
  ghost: '',
  base: '',
  selected: '',
  held: '',
  editing: false,
})

export const fetch_files_store = defineStore('files', {
  state: StateDefaults,
  actions: {
    initialize: async function ({ path }) {
      this.path = path
      await this.build()
    },
    build: async function () {
      const log = fetch_log_store()
      await log.info(`Build file tree at ${this.path} ... `)
      const tree = await FileTree.make(this.path)

      this.tree = tree
      this.base = tree.base.uuid
      this.directory[tree.base.uuid] = tree.base

      await tree.listen(async (data) => {
        if (this.tree === undefined) {
          throw new FileTreeNotEstablishedError()
        }

        const { event, path: relative } = data
        const identity = this.tree.identify(relative)

        if (!identity || identity instanceof FileIdentityContract) {
          return
        }

        const { item, parent } = identity
        const target = parent || item

        switch (event) {
          case ChokidarEvent.ADD:
          case ChokidarEvent.ADD_DIR:
          case ChokidarEvent.DELETE:
          case ChokidarEvent.DELETE_DIR:
            await log.debug(`Refresh ${target.path}`)
            target.loaded = false
            await this.load({ item: target })
            break
        }
      })

      await log.info(`File tree at ${this.path} ready`)
      await this.toggle({ item: this.tree.base })
    },
    clear: async function () {
      this.tree = undefined
      this.directory = {}
    },
    identify: async function (criteria) {
      const log = fetch_log_store()
      const { item, path } = criteria

      if (this.tree === undefined) {
        throw new FileTreeNotEstablishedError()
      }

      if (item) {
        return item
      }

      if (path === this.tree.base.path) {
        return this.tree.base
      }

      const relative = await this.tree.relative(path)
      let identity = this.tree.identify(relative || '')

      for (;;) {
        if (!identity) {
          throw new Error(`File path ${path} does not exist`)
        }

        if (identity instanceof FileIdentity) {
          break
        }

        if (identity instanceof FileIdentityContract) {
          const contract = await identity.item.load(
            this.tree.base,
            async (object) => {
              switch (object.type) {
                case 'read':
                  await log.debug(`Read (identity) ${object.bytes} bytes @ ${object.path}`)
                  break

                case 'populated':
                  await log.debug(`Populate (identity) ${object.path}`)
                  break
              }
            },
          )

          this.fulfill(contract)
          await log.debug(`Item directory @ ${Object.keys(this.directory).length})`)

          identity = await FileTree.search(identity.item, identity.queue)
        } else {
          throw new TypeError(`File path ${path} failed to identify`)
        }
      }

      return identity.item
    },
    fulfill: function (contract: FileLoadContract) {
      const { item, payload } = contract

      if (item.directory) {
        item.fill(payload)

        for (const file of payload.children) {
          this.directory[file.uuid] = file
        }
      } else {
        item.render(payload)
      }

      const repository_metadata = fetch_repository_metadata_store()
      repository_metadata.load()
    },
    toggle: async function (criteria) {
      const item = await this.identify(criteria)

      if (!item.expanded) {
        await this.load({ item })
      }

      item.expanded = !item.expanded

      return item
    },
    container: async function (criteria) {
      const item = await this.identify(criteria)
      if (item.directory) {
        return item
      }

      return item.parent
    },
    load: async function (criteria) {
      const log = fetch_log_store()
      const item: File = await this.identify(criteria)
      await log.trace(`Access (load) ${item.path}`)

      if (!(item.ephemeral || item.image)) {
        const contract = await item.load(
          this.tree.base,
          async (object) => {
            switch (object.type) {
              case 'read':
                await log.trace(`Read (load) ${object.bytes} bytes @ ${object.path}`)
                break

              case 'populated':
                await log.trace(`Populate (load) ${object.path}`)
                break
            }
          },
        )

        this.fulfill(contract)
        await log.trace(`Item directory @ ${Object.keys(this.directory).length})`)

        await log.debug(`Load ${item.path}`)
      }

      return item
    },
    open: async function (criteria) {
      const { container = false } = criteria
      const item = await this.identify(criteria)

      await item.open(container)
    },
    haunt: async function (criteria) {
      const { directory = false, post } = criteria
      const item = await this.load(criteria)

      await this.select({ item })

      if (!item.expanded) {
        await this.toggle({ item })
      }

      const ghost = item.directory
        ? item.haunt(directory)
        : item.parent.haunt(directory, item)

      this.ghost = ghost.uuid
      this.selected = ghost.uuid
      this.post = post
      this.editing = true

      this.directory[ghost.uuid] = ghost

      await this.select({ item: ghost })

      return ghost
    },
    reselect: async function () {
      if (!this.active) {
        return
      }

      const item = this.directory[this.active]
      await this.select({ item })
    },
    select: async function (criteria) {
      let item = await this.load(criteria)

      if (!item && this.active) {
        item = this.directory[this.active]
      }

      let parent = item
      while (parent.parent) {
        parent = parent.parent

        if (!parent.expanded) {
          await this.toggle({ item: parent })
        }
      }

      this.active = item.uuid
      this.selected = item.uuid
      this.content = ''

      if (!(item.ephemeral || item.directory) && item.document) {
        this.content = item.document.content
      }

      return item
    },
    save: async function (criteria) {
      const { content } = criteria
      const item = await this.load(criteria)

      await item.write(content)
      item.loaded = false

      return item
    },
    submit: async function (criteria) {
      const { input, title } = criteria

      if (this.selected === '') {
        throw new FileNotSelectedError('No File Selected')
      }

      const selected = this.directory[this.selected]
      const { ephemeral, parent, directory } = selected

      this.name({ edit: false })

      let name = input.toLowerCase().replaceAll(/[ .-]+/g, '.').replaceAll(/[^\d.a-z-]/g, '')

      if (title && !directory) {
        if (ephemeral) {
          name = `${name}.md`
        } else {
          const { extension } = selected
          name = `${name}${extension || ''}`
        }
      }

      const item = ephemeral
        ? await this.create({ item: parent, name, directory })
        : await this.rename({ item: selected, name })

      if (item === undefined) {
        throw new FileSubmitFailureError()
      }

      await this.select({ item })

      if (this.post) {
        await this.post(item.path || '')
      }

      return item
    },
    edit: async function (criteria) {
      const item = await this.select(criteria)
      this.name({ edit: true })
      return item
    },
    blur: async function (criteria) {
      const { path } = criteria
      const selected = this.directory[this.selected]

      if (selected.path !== path) {
        return
      }

      this.name({ edit: false })

      return selected
    },
    move: async function (criteria) {
      const { proposed } = criteria
      const item = await this.identify(criteria)

      const parents = {
        original: item.parent,
        replacement: await this.container({ path: proposed }),
      }

      const path = await item.move(parents.replacement.path)

      item.loaded = false

      if (parents.original) {
        parents.original.loaded = false
        await this.load({ item: parents.original })
      }

      if (parents.replacement) {
        parents.replacement.loaded = false
      }

      return await this.select({ path })
    },
    rename: async function (criteria) {
      const { name } = criteria
      const item = await this.identify(criteria)

      if (item.parent) {
        item.parent.loaded = false
      }

      const path = await item.rename(name)

      return await this.identify({ path })
    },
    create: async function (criteria) {
      const { name, directory = false } = criteria
      const item = await this.identify(criteria)

      const path = await item.create(name, directory)

      item.loaded = false

      return await this.identify({ path })
    },
    name: function (data) {
      const { edit } = data
      this.editing = edit

      if (this.editing) {
        return
      }

      if (this.selected != '' && this.ghost !== '') {
        const selected = this.directory[this.selected]
        if (selected.ephemeral) {
          this.directory[this.ghost].exercise()

          delete this.directory[this.ghost]

          this.ghost = ''
          this.selected = ''
        }
      }
    },
    delete: async function (criteria) {
      const item = await this.identify(criteria)

      await item.delete()

      item.parent.loaded = false
      await this.load({ item: item.parent })
    },
    drag: async function (path) {
      this.held = path
    },
    drop: async function (path) {
      await this.move({ path: this.held, proposed: path })
      this.held = ''
    },
  },
})
