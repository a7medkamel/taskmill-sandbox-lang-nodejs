var Promise       = require('bluebird')
  // , config        = require('config')
  , HTTP          = require('./lib/http')
  , Repository    = require('./lib/repo')
  , Code          = require('./lib/code')
  ;

Promise.config({
  longStackTraces: true
})

process.on('unhandledRejection', (err, p) => {
  console.error(new Date().toUTCString(), 'unhandledRejection', err.message);
  console.error(err.stack);

  // process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(new Date().toUTCString(), 'uncaughtException', err.message);
  console.error(err.stack);

  // process.exit(1);
});

function main() {
  // let { secret, tailf, remote, sha, base_url, cmd, args } = config.get('sandbox');
  Promise
    .all([
        (new HTTP()).listen({ port : 1337 })
      , Repository.create()
    ])
    .spread((app, repo) => {
      app.use((req, res, next) => {
        (new Code({ repo }))
          .run(req, res, next)
          .catch((err) => {
            res.status(500).send(err.toString());
          });
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

if (require.main === module) {
  main();
}

module.exports = {
  main
};
