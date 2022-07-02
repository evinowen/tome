let maximized = false

export default {
  is_window_maximized: jest.fn(async () => maximized),
  restore_window: jest.fn(async () => { maximized = false }),
  maximize_window: jest.fn(async () => { maximized = true }),
  minimize_window: jest.fn(async () => { maximized = false }),
  close_window: jest.fn(async () => false)
}
