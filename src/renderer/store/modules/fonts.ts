import { defineStore } from 'pinia'

interface FontFamily {
  fonts: FontData[]
}

export interface State {
  library: Map<string, FontFamily>
  families: string[]
}

export const StateDefaults = (): State => ({
  library: new Map<string, FontFamily>(),
  families: [],
})

export const fetch_fonts_store = defineStore('fonts', {
  state: StateDefaults,
  actions: {
    hydrate: async function () {
      this.library.clear()

      const fonts = await window.queryLocalFonts()
      for (const font of fonts) {
        let font_family = this.library.get(font.family)
        if (font_family) {
          font_family.fonts.push(font)
        } else {
          font_family = { fonts: [ font ] } as FontFamily
          this.library.set(font.family, font_family)
        }
      }

      this.families = [ ...this.library.keys() ]
    },
  },
})
