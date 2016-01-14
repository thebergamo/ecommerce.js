'use strict';

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const db = require('./database');
const Server = require('./server');

module.exports = {start};

function start () {
  return Promise.resolve()
  .then(() => {
    // load core plugins
    return fs.readdirAsync(__dirname)
    .filter(filterCoreFiles)
    .map((file) => {
      return {
        register: require(path.join(__dirname, file)),
        options: { database: db }
      };
    })
    .then(registerToServer);
  })
  .then(() => {
    // load plugins
    return fs.readdirAsync(path.join(__dirname, '..'))
      .filter(filterCoreDirectories)
      .map((dir) => {
        return {
          register: require(path.join(__dirname, '..', dir)),
          options: { database: db }
        };
      })
      .then(registerToServer);
  })
  .then(() => {
    // associate db
    db.doAssociations(db);
  })
  .then(() => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    Server.start((err) => {
      if (err) {
        throw err;
      }

      Server.log('info', 'Server running at: ' + Server.info.uri);
    });
  })
  .catch((err) => {
    Server.log('==> App Error', err);
    process.exit();
  });
}

function filterCoreFiles (fileName) {
  try {
    let stat = fs.statSync(path.join(__dirname, fileName));

    if (stat.isFile() && fileName.match(/^[^.]/) && ['server.js', 'bootstrap.js', 'database.js', 'migration.js'].indexOf(fileName) === -1) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

function filterCoreDirectories (dirName) {
  try {
    let stat = fs.statSync(path.join(__dirname, '..', dirName));
    if (stat.isDirectory() && dirName.match(/^[^.]/) && ['core'].indexOf(dirName) === -1) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

function registerToServer (plugins) {
  return new Promise((resolve, reject) => {
    Server.register(plugins, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}
