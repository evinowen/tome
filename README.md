# Tome

### Windows Prerequisites
Using an Administrative (or elevated) PowerShell install Python, Perl, and NASM dependencies:
```
choco install python2 --version=2.7.15 --params "/InstallDir:$Env:SystemDrive\Python27"
choco install strawberryperl
choco install nasm
```

Add both Perl and NASM to the local PATH:
```
$env:Path += ";$Env:SystemDrive\Strawberry\perl\bin;$Env:ProgramFiles\NASM"
```

Using an Administrative (or elevated) PowerShell, install the `windows-build-tools` package
globally using the following command:
```
npm install --global node-gyp
npm install --global --production windows-build-tools@4.0.0
```

### Build Workflow

Install the application:
```
npm install
npm run electron-rebuild
```

Rebuild native modules (nodegit) for Electron
```
npm run electron-rebuild
```

Build the renderer &mdash; this operation outputs renderer artifacts to `./dist-renderer`
```
npm run build-renderer
```
Note, running this command from an elevated prompt will result in build issues caused by
the `nodegit` build process testing `OpenSSL` as several of these tests fail when ran from
an elevated prompt.

Finally build the application package &mdash; this operation outputs application artifacts
to `./dist`
```
npm run build
```

### Troubleshooting
You may run into some trouble while building OpenSSL for NodeGit, if you do you will need
to either manually issue commands
or delete OpenSSL content and redownload the package.

To clear the downloaded OpenSSL package, issue the following command from PowerShell:
```
Remove-Item node_modules\nodegit\vendor\openssl -Recurse -Force -Confirm:$false
```

Or from bash:
```
rm -rf ./node_modules/nodegit/vendor/openssl
```

### Testing
Optionally the test suite for the renderer can be run using the following command:
```
npm run test-renderer
```
