'use strict';

require('dotenv').config({ path: __dirname + '/.env', silent: true });

// load deps
const lab = exports.lab = require('lab').script();
const chai = require('chai');

// chai plugins
chai.use(require('chai-things'));

global.expect = chai.expect;

// prepare environment
global. it = lab.it;
global.describe = lab.describe;
global.before = lab.before;
global.beforeEach = lab.beforeEach;

// get the server
global.before((done) => {
  require('../src/core/bootstrap').start()
  .then(() => {
    global.server = require('../src/core/server');
    global.db = global.server.database;
    return done();
  });
});
