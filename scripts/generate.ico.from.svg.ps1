$Root = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

magick convert -background none $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.png

magick convert -background none $Root\..\assets\icon\tome.svg -resize 16x16 $Root\..\assets\icon\tome.16.png
magick convert -background none $Root\..\assets\icon\tome.svg -resize 32x32 $Root\..\assets\icon\tome.32.png
magick convert -background none $Root\..\assets\icon\tome.svg -resize 64x64 $Root\..\assets\icon\tome.64.png
magick convert -background none $Root\..\assets\icon\tome.svg -resize 128x128 $Root\..\assets\icon\tome.128.png
magick convert -background none $Root\..\assets\icon\tome.svg -resize 256x256 $Root\..\assets\icon\tome.256.png
magick convert -background none $Root\..\assets\icon\tome.svg -resize 512x512 $Root\..\assets\icon\tome.512.png
magick convert -background none $Root\..\assets\icon\tome.svg -resize 1024x1024 $Root\..\assets\icon\tome.1024.png

magick $Root\..\assets\icon\tome.svg `
  -define icon:auto-resize=256 `
  -background white -transparent white `
  -compress zip $Root\..\build\icon.ico

magick $Root\..\assets\icon\tome.svg `
  -background white -transparent white `
  -resize 256x256 $Root\..\build\icon.256.png

magick $Root\..\assets\icon\tome.svg `
  -background white -transparent white `
  -resize 512x512 $Root\..\build\icon.512.png

magick $Root\..\assets\icon\tome.svg `
  -define icon:auto-resize=16,24,32,48,64,128,256 `
  -background white -transparent white `
  -compress zip $Root\..\build\icon.ico
