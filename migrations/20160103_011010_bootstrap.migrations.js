'use strict';

module.exports = { up, down };

function up (db) {
  const User = require('../src/shared/user/model')(db.sequelize, db.Sequelize);
  return User.sync();
}

function down (db) {
  const User = require('../src/shared/user/model')(db.sequelize, db.Sequelize);
  return User.drop();
}
