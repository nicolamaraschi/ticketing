// Classe di base per gli errori dell'API
class ApiError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Errore 400 - Bad Request
  class BadRequestError extends ApiError {
    constructor(message = 'Richiesta non valida') {
      super(message, 400);
    }
  }
  
  // Errore 401 - Unauthorized
  class UnauthorizedError extends ApiError {
    constructor(message = 'Non autorizzato') {
      super(message, 401);
    }
  }
  
  // Errore 403 - Forbidden
  class ForbiddenError extends ApiError {
    constructor(message = 'Accesso negato') {
      super(message, 403);
    }
  }
  
  // Errore 404 - Not Found
  class NotFoundError extends ApiError {
    constructor(message = 'Risorsa non trovata') {
      super(message, 404);
    }
  }
  
  // Errore 409 - Conflict
  class ConflictError extends ApiError {
    constructor(message = 'Conflitto con lo stato corrente della risorsa') {
      super(message, 409);
    }
  }
  
  // Errore 500 - Internal Server Error
  class InternalServerError extends ApiError {
    constructor(message = 'Errore interno del server') {
      super(message, 500);
    }
  }
  
  // Handler globale per gli errori
  const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        message: err.message
      });
    }
  
    console.error('Errore non gestito:', err);
  
    return res.status(500).json({
      message: 'Si è verificato un errore interno del server'
    });
  };
  
  module.exports = {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    errorHandler
  };