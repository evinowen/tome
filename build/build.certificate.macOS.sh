#!/usr/bin/env sh
KEY_CHAIN=build.keychain
CERTIFICATE_P12=certificate.p12

echo $CERTIFICATE_BASE64 | base64 --decode > $CERTIFICATE_P12

security create-keychain -p actions $KEY_CHAIN

security default-keychain -s $KEY_CHAIN

security unlock-keychain -p actions $KEY_CHAIN

security import $CERTIFICATE_P12 -k $KEY_CHAIN -T /usr/bin/codesign;

security set-key-partition-list -S apple-tool:,apple: -s -k actions $KEY_CHAIN

rm -fr *.p12
