require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./models');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/products', productRoutes);

// Route de test
app.get('/api', (req, res) => {
  res.json({
    message: 'API de gestion de produits avec Sequelize',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      search: '/api/products/search?q=keyword'
    }
  });
});

// Synchronisation de la base de données
db.sequelize.sync({ alter: true }) // alter: true pour développement
  .then(() => {
    console.log('✅ Base de données synchronisée avec Sequelize');
  })
  .catch(err => {
    console.error('❌ Erreur de synchronisation:', err);
  });

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📡 Mode: ${process.env.NODE_ENV}`);
  console.log(`🗄️  ORM: Sequelize`);
});