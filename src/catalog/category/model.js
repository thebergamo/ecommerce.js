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
    parentId: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    status: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        Category.belongsTo(models.Category, { foreignKey: 'parentId' });
        Category.belongsToMany(models.Product,
          { through: models.ProductCategory, foreignKey: 'category_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      }
    }
  });

  return Category;
};

