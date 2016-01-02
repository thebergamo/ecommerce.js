'use strict';

const env = process.env.NODE_ENV || 'development';

const Sequelize = require('sequelize');

const config = require('../../config/config')[env];

let db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Load models
const models = fs.readdirSync('src/entities')
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

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
