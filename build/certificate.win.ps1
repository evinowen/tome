$base64 = $env:CERTIFICATE_BASE64
$filename = 'certificate.p12'

$bytes = [Convert]::FromBase64String($base64)
[IO.File]::WriteAllBytes($filename, $bytes)
