'use strict';

// Load deps
const fs = require('fs');
const Hapi = require('hapi');
const boomDecorators = require('hapi-boom-decorators');

// Load database
const db = require('./database');

module.exports = getServer();

function getServer () {
  // Instantiate a new server
  const server = new Hapi.Server();

  // Set the port for listening
  server.connection({
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT
  });

  // Expose database
  if (process.env.NODE_ENV === 'test') {
    server.database = db;
  }

  // Load routes
  const plugins = fs.readdirSync('src/entities')
    .filter((dir) => {
      return dir.match(/^[^.]/);
    })
    .map((entity) => {
      return {
        register: require(path.join('../entities/', entity, entity + '.routes')),
        options: {database: db}
      };
    });

  plugins.push({register: boomDecorators});

  server.register(plugins, (err) => {
    if (err) {
      throw err;
    }

    if (!module.parent) {
      server.start((err) => {
        if (err) {
          throw err;
        }

        server.log('info', 'Server running at: ' + server.info.uri);
      });
    }
  });
}

