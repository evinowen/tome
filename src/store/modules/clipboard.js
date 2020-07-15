import { remote } from 'electron'

export default {
  state: {
    error: null,
    action: null,
    content: null
  },
  mutations: {
    set: function (state, data) {
      const { action, content } = data

      state.action = action
      state.content = content
    },
    clear: function (state) {
      state.action = null
      state.content = null
    },
    error: function (state, data) {
      const { message } = data
      console.log('cliboard error', data)
      state.error = message
    }
  },
  actions: {
    cut: async function (context, content) {
      context.commit('set', {
        action: 'cut',
        content
      })
    },
    copy: async function (context, content) {
      context.commit('set', {
        action: 'copy',
        content
      })
    },
    paste: async function (context, content) {
      if (!context.state.content.type) {
        context.commit('error', { message: 'No content' })
      }

      const fs = remote.require('fs')
      const path = remote.require('path')

      const source = context.state.content.target

      console.log('paste file', content)

      // Determine the directory where the file will go
      let directory = content.target
      try {
        // Load the file status of the target to determine if
        // a file or directory is being targetted.
        const status = await new Promise((resolve, reject) => fs.lstat(content.target, (err, status) => err ? reject(err) : resolve(status)))

        if (!status.isDirectory()) {
          // The destination is a file, use the parent
          // directory of the file
          directory = path.dirname(content.target)
        }
      } catch (error) {
        // The destination does not exist
        return context.commit('error', { message: 'Destination does not exist', object: error })
      }

      // Abort if the new directory and the source directory
      // are the same
      if (directory === path.dirname(source)) {
        return context.commit('error', { message: 'Invalid move, same directory' })
      }

      // Determine the basename of the source file
      const basename = path.basename(source)
      const parsed = path.parse(source)

      // Use the file basename to construct an available file name
      let increment = 0
      let destination = path.join(directory, basename)

      while (await new Promise((resolve, reject) => fs.access(destination, (err) => err ? resolve(false) : resolve(true)))) {
        increment++
        destination = path.join(directory, `${parsed.name}.${increment}${parsed.ext}`)
      }

      try {
        switch (context.state.action) {
          case 'cut':
            await new Promise((resolve, reject) => fs.rename(source, destination, (error) => error ? reject(error) : resolve(true)))
            context.commit('clear')
            break

          case 'copy':
            await new Promise((resolve, reject) => fs.copyFile(source, destination, 0, (error) => error ? reject(error) : resolve(true)))
            break
        }
      } catch (error) {
        context.commit('error', { message: 'Failed to execute action', object: error })
        throw error
      }
    }
  }
}
