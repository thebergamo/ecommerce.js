'use strict';

module.exports = (sequelize, DataType) => {
  let Product = sequelize.define('Product', {
    name: {
      type: DataType.STRING(100),
      allowNull: false
    },
    description: {
      type: DataType.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    model: {
      type: DataType.STRING(50),
      allowNull: true
    },
    upc: {
      type: DataType.STRING(13),
      allowNull: true
    },
    price: {
      type: DataType.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        Product.belongsToMany(models.Category,
          { through: 'ProductCategory' });
      }
    }
  });

  return Product;
};
