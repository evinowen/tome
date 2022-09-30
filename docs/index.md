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
