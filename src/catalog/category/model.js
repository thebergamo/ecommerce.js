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
        model: 'categories',
        key: 'id'
      },
      field: 'parent_id'
    },
    status: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'categories',

    classMethods: {
      associate: (models) => {
        Category.belongsTo(models.Category, { foreignKey: 'parent_id' });
        Category.belongsToMany(models.Product,
          { through: models.ProductCategory, foreignKey: 'category_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      }
    }
  });

  return Category;
};

