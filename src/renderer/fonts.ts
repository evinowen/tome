interface FontFamily {
  fonts: FontData[]
}

export const library = new Map<string, FontFamily>()

export async function hydrate () {
  library.clear()

  const fonts = await window.queryLocalFonts()

  for (const font of fonts) {
    let font_family = library.get(font.family)
    if (font_family) {
      font_family.fonts.push(font)
    } else {
      font_family = { fonts: [ font ] } as FontFamily
      library.set(font.family, font_family)
    }
  }
}
