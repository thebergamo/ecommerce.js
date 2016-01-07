'use strict';

const Promise = require('bluebird');

module.exports = { up, down };

function up (db) {
  const Product = require('../src/catalog/product/model')(db.sequelize, db.Sequelize);
  const Category = require('../src/catalog/category/model')(db.sequelize, db.Sequelize);
  Product.associate(db);
  Category.associate(db);
  return Promise.all([Product.sync(), Category.sync()]);
}

function down (db) {
  const Product = require('../src/catalog/product/model')(db.sequelize, db.Sequelize);
  const Category = require('../src/catalog/category/model')(db.sequelize, db.Sequelize);
  return Promise.all([Product.drop(), Category.drop()]);
}

