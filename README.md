# tome

## Build
```
npm run electron:build
```

## Development
Building for development can be tricky, primarily because `nodegit` (https://github.com/nodegit/nodegit) is a native node module.

### Windows
Using an Administrative (or elevated) PowerShell, Perl and NASM dependencies:
```
choco install perl
choco install nasm

Add both Perl and NASM to the local PATH:
```
$env:Path += ";C:\Strawberry\perl\bin;C:\Program Files\NASM"
```

Using an Administrative (or elevated) PowerShell, install the `windows-build-tools` package globally using the following command:
```
npm install --global node-gyp
npm install --global --production windows-build-tools@4.0.0
```

Next, open PowerShell to the project directory and set `BUILD_DEBUG` to **True**:
```
$env:BUILD_DEBUG = $true
```

Finally, start and watch the application:
```
npm run electron:serve
```

Optionally, open another PowerShell terminal and start jest:
```
npm run test:unit -- --watch
```

#### Troubleshooting
You may run into some trouble while building OpenSSL for NodeGit, if you do you will need to either manually issue commands
or delete OpenSSL content and redownload the package.

To clear the downloaded OpenSSL package, issue the following command from PowerShell:
```
Remove-Item node_modules\nodegit\vendor\openssl
```
