'use strict';

const Promise = require('bluebird');

module.exports = { up, down };

function up (db) {
  const Product = require('../src/catalog/product/model')(db.sequelize, db.Sequelize);
  const Category = require('../src/catalog/category/model')(db.sequelize, db.Sequelize);
  const productCategory = require('../src/catalog/productCategory/model')(db.sequelize, db.Sequelize);
  return Promise.all([Product.sync(), Category.sync()])
  .then(() => {
    return productCategory.sync();
  });
}

function down (db) {
  const Product = require('../src/catalog/product/model')(db.sequelize, db.Sequelize);
  const Category = require('../src/catalog/category/model')(db.sequelize, db.Sequelize);
  const productCategory = require('../src/catalog/productCategory/model')(db.sequelize, db.Sequelize);
  return Promise.all([Product.drop(), Category.drop()])
  .then(() => {
    return productCategory.drop();
  });
}

