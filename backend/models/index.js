const { Sequelize } = require('sequelize');
const config = require('../config/config');
const ProductModel = require('./Product');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Initialisation des modèles
const Product = ProductModel(sequelize);

// Associations (si plusieurs tables)
// Product.hasMany(OtherModel);

const db = {
  sequelize,
  Sequelize,
  Product
};

// Test de la connexion
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Connecté à la base de données avec Sequelize');
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err);
  });

module.exports = db;