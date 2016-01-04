'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataType) => {
  return sequelize.define('User', {
    id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataType.STRING(40),
      allowNull: false,
      unique: true
    },
    roles: {
      type: DataType.ENUM,
      values: ['admin', 'publisher', 'customer'],
      defaultValue: 'publisher'
    },
    firstName: {
      type: DataType.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataType.STRING(50),
      allowNull: false
    },
    email: {
      type: DataType.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataType.STRING(200),
      allowNull: false,
      validate: {
        is: /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
      }
    },
    status: {
      type: DataType.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: function (user) {
        user.set({
          password: hashPassword(user.get('password'))
        });
      },
      beforeUpdate: function (user) {
        if (!user.changed('password')) {
          return;
        }
        user.set({
          password: hashPassword(user.get('password'))
        });
      }
    },
    instanceMethods: {
      validatePassword: function (password) {
        return bcrypt.compareSync(password, this.get('password'));
      }
    }
  });
};

function hashPassword (password) {
  if (!password) {
    return false;
  }

  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
