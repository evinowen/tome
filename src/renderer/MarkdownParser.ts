import { marked } from 'marked'

const renderer = {
  heading (text, level) {
    return `
      <h${level}>
        <span class="rendered-header">
          ${text}
        </span>
      </h${level}>
    `
  },
}

marked.use({ renderer })

export default {
  parse: (content) => marked.parse(content),
}
