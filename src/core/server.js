'use strict';

require('dotenv').load();

// Load deps
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const boomDecorators = require('hapi-boom-decorators');

// Load database
let server;
const db = require('./database');
const log = require('./log');
const auth = require('./auth');

module.exports = server = new Hapi.Server();

// Set the port for listening
server.connection({
  host: process.env.SERVER_HOST || 'localhost',
  port: process.env.SERVER_PORT || '8000'
});

// Expose database
if (process.env.NODE_ENV === 'test') {
  server.database = db;
}

// Load routes
let routes = ['shared', 'admin', 'catalog'].map((type) => {
  return readDir(type);
});

let plugins = _.remove(_.flatten(routes), (pl) => { return pl !== undefined; });

plugins.push({register: auth});
plugins.push({register: boomDecorators});
plugins.push({register: log});

server.register(plugins, (err) => {
  if (err) {
    throw err;
  }

  return;
});

function readDir (type) {
  return fs.readdirSync(path.join('src', type))
    .filter((dir) => {
      return dir.match(/^[^.]/);
    })
    .map((entity) => {
      let root = path.join(__dirname, '..', type, entity, 'route.js');

      try {
        fs.statSync(root).isFile();
      } catch (err) {
        return;
      }

      return {
        register: require(root),
        options: {database: db}
      };
    });
}
