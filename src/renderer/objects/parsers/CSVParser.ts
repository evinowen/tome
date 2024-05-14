import Papa from 'papaparse'

export default class CSVParser {
  static parse (content) {
    const data = Papa.parse(content).data

    const rows = []
    for (const datum of data) {
      const columns = datum.map((value) => `<td style="padding: 2px 4px">${value}</td>`)
      rows.push(`<tr>${columns.join('')}</tr>`)
    }

    return `<table style="font-family: monospace">${rows.join('')}</table>`
  }
}
