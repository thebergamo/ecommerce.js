'use strict';

module.exports = (db) => {
  const User = require('../src/shared/user/model')(db.sequelize, db.Sequelize);

  return { up, down };

  function up () {
    return User.sync();
  };

  function down () {
    return User.drop();
  }
}
