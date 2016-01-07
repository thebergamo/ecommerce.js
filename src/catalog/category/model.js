'use strict';

module.exports = (sequelize, DataType) => {
  let Category = sequelize.define('Category', {
    name: {
      type: DataType.STRING(100),
      allowNull: false
    },
    description: {
      type: DataType.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    status: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        Category.hasOne(Category, { as: 'parent' });
        Category.belongsToMany(models.Product,
          { through: 'ProductCategory' });
      }
    }
  });

  return Category;
};

