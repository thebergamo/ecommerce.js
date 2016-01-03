'use strict';

const Promise = require('bluebird');
const Server = require('./server');

module.exports = {start};

function start () {
  return Promise.resolve()
  .then(Server.start((err) => {
    if (err) {
      throw err;
    }

    Server.log('info', 'Server running at: ' + Server.info.uri);
  }))
  .catch((err) => {
    Server.log('error', err);
    process.exit();
  });
  
}
