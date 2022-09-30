![tome](/assets/icon/tome.github.png)
Git integrated cross-platform markdown editor, built leveraging Electron (https://github.com/electron/electron), Vue (https://github.com/vuejs/vue), and NodeGit (https://github.com/nodegit/nodegit).

Tome is intended as a general markdown editor and note taking application.
Presently it supports the following features:

- Load user-specified folder as workspace for editing documents.
- Track changes to the workspace leveraging the Git version control system.
- Edit markdown documents with syntax highlighting.
- Render and display markdown document within the application.
- Plain-text and regex search supporting single or multiple file search.
- Ability to create Git commits and push updates to remote repositories.
- Quick commit and push process to streamline updates and ensure the latest copy is replicated for redundancy.
- Load and display images within the workspace.
- Templating engine that enables reusable document hierarchies that can be replicated and enriched with generated metadata.
- Action engine that enables development of custom JavaScript components callable against the document editor or file structure.

As files are composed Tome automatically saves updates, tracking them through the Git versioning system which enables the choice to revert changes or commit changes to record.  Tome streamlines the commit and push process to ensure commits are delivered to remote storage transparently and securely.  Using the quick-save shortcut (`ctrl+shift+s`) a commit is generated through staging all available changes and a boilerplate message and, if enabled, a push is started to transmit updates to the default remote origin.

Tome also contains a powerful templating and action system. Templating allows for the creation of a document hierarchy that can be reused and populated with metadata based on end-user configuration.  Actions enable JavaScript to be written for the underlying Node.js main process, providing access to scripted file-manipulation, complex string manipulation, and essentially all native Node.js environment capabilities.  Finally, components built for these systems are contained within the repository structure of the workspace, making them portable to other users or to forks of the backing Git repository.


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

### Install Workflow

Install the application:
```
npm install
```

Rebuild native modules (nodegit) for Electron
```
npm run rebuild-electron
```

### Validation Workflow
Validate the Main process
```
npm run lint-main
npm run test-main
```

Validate the Renderer process
```
npm run lint-renderer
npm run test-renderer
```

### Build Workflow
Build the renderer &mdash; this operation outputs renderer artifacts to `./dist/renderer`
```
npm run build-renderer
```
Note, running this command from an elevated prompt will result in build issues caused by
the `nodegit` build process testing `OpenSSL` as several of these tests fail when ran from
an elevated prompt.

Finally build the application package &mdash; this operation outputs application artifacts
to `./dist/main`
```
npm run build-electron
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

## License

Copyright (c) Evin Owen. All rights reserved.

Licensed under the [MIT](LICENSE.txt) license.
