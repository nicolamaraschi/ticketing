const jwt = require('./jwt');
const validation = require('./validation');
const errors = require('./errors');
const logger = require('./logger');

// Funzione per formattare le risposte API
const formatResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Funzione per formattare gli errori API
const formatError = (message = 'Error', errors = null) => {
  return {
    success: false,
    message,
    errors
  };
};

// Funzione per generare un ID univoco
const generateUniqueId = (prefix = '') => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${random}`;
};

// Funzione per filtrare i campi sensibili
const filterSensitiveData = (data, sensitiveFields = ['password']) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => filterSensitiveData(item, sensitiveFields));
  }
  
  if (typeof data === 'object') {
    const filtered = { ...data };
    sensitiveFields.forEach(field => {
      if (field in filtered) {
        delete filtered[field];
      }
    });
    return filtered;
  }
  
  return data;
};

module.exports = {
  jwt,
  validation,
  errors,
  logger,
  formatResponse,
  formatError,
  generateUniqueId,
  filterSensitiveData
};