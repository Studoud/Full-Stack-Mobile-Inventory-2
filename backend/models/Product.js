const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le nom du produit est requis'
        },
        len: {
          args: [2, 100],
          msg: 'Le nom doit contenir entre 2 et 100 caractères'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le prix est requis'
        },
        isDecimal: {
          msg: 'Le prix doit être un nombre décimal'
        },
        min: {
          args: [0.01],
          msg: 'Le prix doit être supérieur à 0'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    }
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      beforeCreate: (product) => {
        // Convertir le prix en nombre si c'est une chaîne
        if (typeof product.price === 'string') {
          product.price = parseFloat(product.price);
        }
      },
      beforeUpdate: (product) => {
        if (typeof product.price === 'string') {
          product.price = parseFloat(product.price);
        }
      }
    }
  });

  return Product;
};