const winston = require('winston');

// Crea logger con Winston
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ticketing-system' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
    })
    // Aggiungi qui altri transports come file o servizi di logging
  ]
});

// Versione semplificata se Winston non è disponibile
const simpleLogger = {
  error: (message, meta) => console.error(`ERROR: ${message}`, meta || ''),
  warn: (message, meta) => console.warn(`WARN: ${message}`, meta || ''),
  info: (message, meta) => console.info(`INFO: ${message}`, meta || ''),
  debug: (message, meta) => console.debug(`DEBUG: ${message}`, meta || ''),
};

// Esporta il logger
module.exports = winston ? logger : simpleLogger;

// Middleware per il logging delle richieste HTTP
module.exports.requestLogger = (req, res, next) => {
  const startHrTime = process.hrtime();
  
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${elapsedTimeInMs.toFixed(3)}ms`
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl}`, log);
    } else {
      logger.info(`${req.method} ${req.originalUrl}`, log);
    }
  });
  
  next();
};