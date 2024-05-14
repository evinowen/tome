import { encode } from 'html-entities'

export default class PlainTextParser {
  static parse (content) {
    const encoded = encode(content)

    const encoded_with_linebreaks = encoded.replaceAll(/\r\n|\r|\n/g, '<br />')

    return `<div style="font-family: monospace;">${encoded_with_linebreaks}</div>`
  }
}
