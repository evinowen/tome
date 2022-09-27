const path = require('path')

module.exports = {
  pages: {
    index: {
      entry: 'src/renderer/main.js'
    }
  },
  publicPath: './',
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    target: 'electron-renderer',
    resolve: {
      alias: {
        '@': path.resolve('src/renderer'),
        '?': path.resolve('spec/renderer')
      }
    }
  }
}
