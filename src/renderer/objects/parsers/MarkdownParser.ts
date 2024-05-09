import { marked } from 'marked'
import api from '@/api'

class MarkdownParser {
  static renderer = {
    heading (text, level) {
      return `
        <h${level}>
          <span class="rendered-header">
            ${text}
          </span>
        </h${level}>
      `
    },

    image (href) {
      return `
        <img src="${href}" style="max-width: 100%" />
      `
    },
  }

  static async parse (content, path) {
    const walk = async (token) => {
      if (token.type === 'image') {
        const data = /^!\[([^\]]*)]\(([^)]*)\)$/.exec(String(token.raw))
        // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
        const [ ,, source ] = data

        token.href = /^(http|https):\/\//.test(source) ? source : await api.path.join(path, source)
      }
    }

    return await marked.parse(content, { walkTokens: walk, async: true })
  }
}

marked.use({ renderer: MarkdownParser.renderer })

export default MarkdownParser
