# tome

## Build
```
npm run electron:build
```

## Development
Building for development can be tricky, primarily because `nodegit` (https://github.com/nodegit/nodegit) is a native node module.

### Windows
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

####
```
npm install -g npm-windows-upgrade
```
