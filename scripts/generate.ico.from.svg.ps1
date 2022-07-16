$Root = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

magick $Root\..\assets\icon\tome.png `
  -define icon:auto-resize=16,48,256 `
  -background white -transparent white `
  -compress zip $Root\..\assets\icon\tome.ico
