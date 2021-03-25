module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: './assets/icon/tome.ico'
        }
      }
    }
  },
  transpileDependencies: [
    'vuetify'
  ]
}
