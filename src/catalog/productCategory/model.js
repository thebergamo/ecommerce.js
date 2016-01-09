'use strict';

module.exports = (sequelize, DataType) => {
  let productCategory = sequelize.define('ProductCategory', {
    product_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      },
      unique: 'product_category'
    },
    category_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      },
      unique: 'product_category'
    }
  }, {
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

