const path = require('path')

module.exports = {
  pages: {
    index: {
      entry: 'src/renderer/main.ts'
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
      extensions: ['.vue', '.ts', '.js', '...'],
      alias: {
        '@': path.resolve('src/renderer'),
        '?': path.resolve('spec/renderer')
      }
    }
  }
}
