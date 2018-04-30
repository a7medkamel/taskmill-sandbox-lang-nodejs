var Promise     = require('bluebird')
  , _           = require('lodash')
  , path        = require('path')
  , mime        = require('mime-types')
  , man         = require('taskmill-core-man')
  , git_config  = require('parse-git-config')
  , git_rev     = require('git-rev')
  , git         = require('taskmill-core-git')
  ;

class Code {
  constructor(options = {}) {
    let { repo } = options;

    Object.assign(this, { repo });
  }

  run(req, res, next) {
    return Promise
            .try(() => {
              let { filename, mime_type } = this.func_info(req);

              switch(mime_type) {
                case 'application/javascript':
                  let rel = path.relative(__dirname, path.resolve(process.cwd(), filename));
                  let fct = require(`./${rel}`);

                  if (_.isFunction(fct)) {
                    return fct(req, res, next);
                  }

                  throw new Error('module.exports not set to a function');
                break;
                // case 'text/x-markdown':
                //   return Code
                //           .text(req)
                //           .then((text) => {
                //             let pref = req.accepts(['text/x-markdown', 'text/html']);
                //
                //             if (pref == 'text/x-markdown') {
                //               return text;
                //             }
                //
                //             let options = { gfm : true };
                //
                //             let md      = require('marked').lexer(text, options)
                //               , graph   = _.find(md, o => o.type == 'code' && o.lang == 'dot')
                //               , parsed  = dot(graph.text)
                //               ;
                //
                //             // style https://github.com/sindresorhus/github-markdown-css
                //             return Promise
                //                     .fromCallback((cb) => marked(text, options, cb))
                //                     .then((part) => {
                //                       return pug.renderFile(path.join(__dirname, './view/markdown.pug'), { markdown : part })
                //                     });
                //           })
                //           .then((html) => res.send(html));
                // break;
                // case 'text/html':
                default:
                  return Promise.fromCallback((cb) => res.sendFile(filename, cb));
                break;
              }
            });
  }

  func_info(req) {
    let filename    = req.path
      , { dirname } = this.repo
      ;

    // if (_.startsWith(filename, dirname)) {
    //   filename = filename.substr(_.size(dirname) - 1);
    // }
    filename = filename.replace(dirname, '/');

    filename = filename.substr(1);

    return {
        filename
      , mime_type : mime.lookup(filename)
    }
  }

  text(req) {
    let { filename } = this.func_info(req);

    return Promise.fromCallback((cb) => fse.readFile(filename, 'utf8', cb));
  }

  man(req) {
    return this
            .text(req)
            .then((text) => {
              return man.get(text);
            });
  }
}

module.exports = Code;
