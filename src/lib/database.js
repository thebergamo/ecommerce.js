'use strict';

const fs = require('fs');
const path = require('path');

const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = getConfig(env);

module.exports = getDB();

function getDB () {
  const sequelize = new Sequelize(config.database, config.username, config.password, config);

  let db = {
    sequelize,
    Sequelize
  };

  loadModels(db);

  return db;
}

function loadModels (db) {
  return fs.readdirSync('src/entities')
    .filter((dir) => {
      return dir.match(/^[^.]/);
    })
    .map((entity) => {
      let model = sequelize['import'](path.join('../entities/', entity, entity + '.model'));
      db[model.name] = model;

      if (model.associate) {
        db[model.name].associate(db);
      } 
    });
}

function getConfig (env) {
  env = env === 'test' ? '_TEST' : '';

  return {
    username: process.env['DB_USERNAME' + env],
    password: process.env['DB_PASSWORD' + env],
    database: process.env['DB_NAME' + env],
    host: process.env['DB_HOST' + env],
    port: process.env['DB_PORT' + env],
    dialect: process.env['DB_DIALECT' + env]
  };
}
