var Promise           = require('bluebird')
  , _                 = require('lodash')
  , express           = require('express')
  , winston           = require('winston')
  , bodyParser        = require('body-parser')
  ;

const app = express()

app.use((req, res, next) => {
  HTTP
    .metadata(req)
    .then((metadata) => {
      req.__metadata = metadata;
    })
    .asCallback(next);
});

app.use((req, res, next) => {
  // if streaming, set _body to true, prevents bodyParser from reading the stream
  req._body = HTTP.is_stream();

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.text({ type : ['text/*', 'application/javascript', 'application/xml'] }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(err, req, res, next) {
  if (err) {
    // res.status(500).send(error.errorify(err));
    res.status(500).send(err.toString());
    return;
  }

  return res.end();
});

class HTTP {
  constructor() { }

  static is_stream(req) {
    let pragma = _.get(req, '__metadata.manual.pragma')
      , stream = _.some(pragma, (str) => str === 'stream');

    return stream;
  }

  static metadata(req) {
    // let [ err, metadata ] = safe_parse(req.get('__metadata'));
    //
    // let __metadata = metadata;
    // // todo [akamel] save this on the req or the required module/cache
    // return Promise
    //         .try(() => {
    //           let { mime_type } = Code.func_info(req);
    //
    //           if (mime_type == 'application/javascript') {
    //             return Code
    //                     .man(req)
    //                     .tap((manual) => {
    //                       __metadata.manual = manual;
    //                     })
    //                     .catch((err) => {
    //                       // suppress manual parsing error?
    //                       console.error('error parsing manual');
    //                       console.error(err);
    //                     });
    //           }
    //         });
    return Promise.resolve();
  }

  listen(options = {}) {
    let { port } = options;

    return Promise
            .fromCallback((cb) => app.listen(port, cb))
            .then(() => {
              winston.info(`listening on port ${port}`);

              return app;
            });
  }
}

module.exports = HTTP;
