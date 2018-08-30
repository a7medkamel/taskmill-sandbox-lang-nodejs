var Promise     = require('bluebird')
  , _           = require('lodash')
  , path        = require('path')
  , mime        = require('mime-types')
  , man         = require('taskmill-core-man')
  , git_config  = require('parse-git-config')
  , git_rev     = require('git-rev')
  , git         = require('taskmill-core-git')
  , is_stream   = require('isstream')
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
                    let ret = fct(req, res, next);
                    if (_.isUndefined(ret)) {
                      return;
                    }

                    return Promise
                            .resolve(ret)
                            .then((response = {}) => {
                              let { headers = {} } = response;

                              _.each(headers, (v, k) => {
                                res.setHeader(k, v);
                              });

                              if (_.isNumber(response.statusCode)) {
                                res.status(response.statusCode);
                              } else if (_.isNumber(response.status)) {
                                res.status(response.status);
                              }

                              if (is_stream(response)) {
                                response.pipe(res);
                                return;
                              }

                              let body = _.get(response, 'body');
                              if (is_stream(body)) {
                                body.pipe(res);
                                return;
                              }

                              res.status(200).send(response);
                            });
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
    // todo [akamel] cache this result, since it is called twice per req
    let path        = req.path
      , filename    = undefined
      , { remote }  = this.repo
      , a           = new RegExp(`^/${remote.hostname}/${remote.username}/${remote.repo}/blob/([A-Za-z0-9_.-]+)/`)
      , b           = new RegExp(`^/${remote.username}/${remote.repo}/blob/([A-Za-z0-9_.-]+)/`)
      // , c           = new RegExp(`^/`)
      ;

    if (a.test(path)) {
      filename = path.replace(a, '');
    } else if (b.test(path)) {
      filename = path.replace(b, '');
    } else {
      filename = path.substr(1);
    }

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
