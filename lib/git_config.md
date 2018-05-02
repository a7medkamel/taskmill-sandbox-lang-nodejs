.git/HEAD
```
ref: refs/heads/master
```

.git/config
```
{ core:
   { repositoryformatversion: '0',
     filemode: true,
     bare: false,
     logallrefupdates: true,
     ignorecase: true,
     precomposeunicode: true
   },
  'remote "origin"':
   { url: 'https://github.com/a7medkamel/taskmill-sandbox-lang-nodejs',
     fetch: '+refs/heads/*:refs/remotes/origin/*'
   },
  'branch "master"': {
    remote: 'origin', merge: 'refs/heads/master'
  }
}
```
