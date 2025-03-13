const dotenv = require('dotenv');

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Configurazione dell'applicazione
const config = {
  // Ambiente (development, production, test)
  env: process.env.NODE_ENV || 'development',
  
  // Porta del server
  port: parseInt(process.env.PORT, 10) || 3001,
  
  // Configurazione JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Configurazione CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  // Configurazione generali
  app: {
    name: 'Ticketing System API',
    version: '1.0.0',
    description: 'API per sistema di ticketing'
  },
  
  // Altre configurazioni specifiche per l'ambiente
  get isDevelopment() {
    return this.env === 'development';
  },
  
  get isProduction() {
    return this.env === 'production';
  },
  
  get isTest() {
    return this.env === 'test';
  }
};

module.exports = config;