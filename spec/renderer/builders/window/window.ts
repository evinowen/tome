let maximized = false

export default {
  window: {
    is_maximized: jest.fn(async () => maximized),
    restore: jest.fn(async () => { maximized = false }),
    maximize: jest.fn(async () => { maximized = true }),
    minimize: jest.fn(async () => { maximized = false }),
    close: jest.fn(async () => false)
  }
}
