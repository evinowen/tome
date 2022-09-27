let text = ''

export default {
  clipboard_paste: jest.fn(),
  clipboard_readtext: jest.fn(() => text),
  clipboard_writetext: jest.fn((value) => { text = value })
}
