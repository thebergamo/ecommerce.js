'use strict';

const fs = require('fs');
const path = require('path');

const Sequelize = require('sequelize');

let db;

const config = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'example',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: process.env.DB_DIALECT || 'postgres'
};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = db = { sequelize, Sequelize };

loadModels(db);
doAssociations(db);

function loadModels (db) {
  return ['shared', 'admin', 'catalog'].map((type) => {
    return readDir(type);
  });
}

function doAssociations (db) {
  Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  return;
}

function readDir (type) {
  return fs.readdirSync(path.join('src', type))
    .filter((dir) => {
      return dir.match(/^[^.]/);
    })
    .map((entity) => {
      const root = path.join(__dirname, '..', type, entity, 'model.js');

      try {
        fs.statSync(root).isFile();
      } catch (err) {
        return;
      }

      let model = sequelize['import'](root);
      db[model.name] = model;
    });
}
