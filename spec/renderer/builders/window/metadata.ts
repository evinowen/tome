export default {
  app: {
    getPath: jest.fn(async (path) => `/home/${path}`),
    getVersion: jest.fn(async () => '0.0.0'),
    getProcess: jest.fn(async () => ({
      versions: {
        chrome: '0.0.0',
        electron: '0.0.0',
        node: '0.0.0',
        v8: '0.0.0'
      },
      sandboxed: false
    }))
  }
}
