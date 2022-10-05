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
  devServer: {
    hot: false,
    liveReload: false
  },
  configureWebpack: {
    target: 'web',
    resolve: {
      alias: {
        '@': path.resolve('src/renderer'),
        '?': path.resolve('spec/renderer')
      }
    }
  }
}
