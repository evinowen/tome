$Root = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

magick convert -background none -resize 1024x1024 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.1024.png

magick $Root\..\assets\icon\tome.1024.png `
  -define icon:auto-resize=256 `
  -background white -transparent white `
  -compress zip $Root\..\build\icon.ico

magick $Root\..\assets\icon\tome.1024.png `
  -resize 256x256 $Root\..\build\icon.256.png

magick $Root\..\assets\icon\tome.1024.png `
  -resize 512x512 $Root\..\build\icon.512.png

magick $Root\..\assets\icon\tome.1024.png `
  -define icon:auto-resize=32,48,64,128,256 `
  -background white -transparent white `
  -compress zip $Root\..\assets\icon\tome.ico
