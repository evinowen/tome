module.exports = {
  publicPath: './',
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    target: 'electron-renderer'
  }
}
