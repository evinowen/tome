import component from '@/objects/ComponentFactory'

export default component('window')(
  ({ handle }, win) => {
    handle('is-maximized', () => win.isMaximized())

    handle('minimize', () => win.minimize())

    handle('maximize', () => win.maximize())

    handle('restore', () => win.restore())

    handle('close', () => win.close())
  },
)
