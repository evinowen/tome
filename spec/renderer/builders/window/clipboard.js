let text = ''

export default {
  clipboard: {
    paste: jest.fn(),
    readtext: jest.fn(() => text),
    writetext: jest.fn((value) => { text = value })
  }
}
