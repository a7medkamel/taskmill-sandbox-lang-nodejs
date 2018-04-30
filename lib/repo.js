var Promise     = require('bluebird')
  , _           = require('lodash')
  , git_config  = require('parse-git-config')
  , git_rev     = require('git-rev')
  , git         = require('taskmill-core-git')
  ;

class Repository {
  constructor(options = {}) {
    let { remote, branch, dirname } = options;

    Object.assign(this, { remote, branch, dirname });
  }

  static create() {
    let config  = Promise.fromCallback((cb) => git_config(cb))
      , branch  = Promise.fromCallback((cb) => git_rev.branch((ret) => cb(null, ret)))
      ;

    return Promise
            .all([config, branch])
            .spread((config, branch) => {
              let remote    = git.remote(config['remote "origin"']['url'])
                // , dirname   = `/${remote.username}/${remote.repo}/blob/${branch}/`
                , dirname   = new RegExp(`^/${remote.username}/${remote.repo}/blob/([A-Za-z0-9_.-]+)/`)
                ;

              return new Repository({ remote, branch, dirname });
            });
  }
}

module.exports = Repository;
