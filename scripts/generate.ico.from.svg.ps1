$Root = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

magick $Root\..\assets\icon\tome.png `
  -define icon:auto-resize=256 `
  -background white -transparent white `
  -compress zip $Root\..\build\icon.ico

magick $Root\..\assets\icon\tome.png `
  -resize 256x256 $Root\..\build\icon.png

magick $Root\..\assets\icon\tome.png `
  -define icon:auto-resize=32,48,64,128,256 `
  -background white -transparent white `
  -compress zip $Root\..\assets\icon\tome.ico
