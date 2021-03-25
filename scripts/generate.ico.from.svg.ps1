$Root = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

magick convert -background none -resize 16x16 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.16.png
magick convert -background none -resize 32x32 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.32.png
magick convert -background none -resize 64x64 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.64.png
magick convert -background none -resize 128x128 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.128.png
magick convert -background none -resize 256x256 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.256.png
magick convert -background none -resize 512x512 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.512.png
magick convert -background none -resize 1024x1024 $Root\..\assets\icon\tome.svg $Root\..\assets\icon\tome.1024.png

magick convert -background transparent `
  $Root\..\assets\icon\tome.16.png  `
  $Root\..\assets\icon\tome.32.png  `
  $Root\..\assets\icon\tome.64.png  `
  $Root\..\assets\icon\tome.128.png  `
  $Root\..\assets\icon\tome.256.png  `
  $Root\..\assets\icon\tome.512.png  `
  $Root\..\assets\icon\tome.1024.png  `
  $Root\..\assets\icon\tome.ico
