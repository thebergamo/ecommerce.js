'use strict';

const Sequelize = require('sequelize');

const config = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'example',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: process.env.DB_DIALECT || 'postgres'
};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = { sequelize, Sequelize, doAssociations };

function doAssociations (db) {
  Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  return;
}
