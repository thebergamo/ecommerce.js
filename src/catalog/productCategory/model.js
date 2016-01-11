'use strict';

module.exports = (sequelize, DataType) => {
  let productCategory = sequelize.define('ProductCategory', {
    product_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      unique: 'product_category'
    },
    category_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      unique: 'product_category'
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'product_categories',

    underscored: true,
    classMethods: {
      associate: (models) => {
        productCategory.belongsTo(models.Product, {
          foreignKey: 'product_id'
        });
        productCategory.belongsTo(models.Category, {
          foreignKey: 'category_id'
        });
      }
    }
  });

  return productCategory;
};

