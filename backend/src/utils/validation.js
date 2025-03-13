// Validazione email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validazione password (minimo 6 caratteri)
  const isValidPassword = (password) => {
    return password && password.length >= 6;
  };
  
  // Validazione nome utente
  const isValidName = (name) => {
    return name && name.trim().length >= 2;
  };
  
  // Validazione ticket
  const validateTicket = (ticketData) => {
    const errors = {};
  
    if (!ticketData.title || ticketData.title.trim().length < 5) {
      errors.title = 'Il titolo deve essere di almeno 5 caratteri';
    }
  
    if (!ticketData.description || ticketData.description.trim().length < 10) {
      errors.description = 'La descrizione deve essere di almeno 10 caratteri';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Validazione messaggio
  const validateMessage = (messageData) => {
    const errors = {};
  
    if (!messageData.content || messageData.content.trim().length === 0) {
      errors.content = 'Il contenuto del messaggio non può essere vuoto';
    }
  
    if (!messageData.ticketId) {
      errors.ticketId = 'ID del ticket mancante';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Validazione utente
  const validateUser = (userData) => {
    const errors = {};
  
    if (!isValidName(userData.name)) {
      errors.name = 'Il nome deve essere di almeno 2 caratteri';
    }
  
    if (!isValidEmail(userData.email)) {
      errors.email = 'Email non valida';
    }
  
    if (userData.password && !isValidPassword(userData.password)) {
      errors.password = 'La password deve essere di almeno 6 caratteri';
    }
  
    if (['ADMIN', 'SUPPORT', 'CLIENT'].indexOf(userData.role) === -1) {
      errors.role = 'Ruolo non valido';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  module.exports = {
    isValidEmail,
    isValidPassword,
    isValidName,
    validateTicket,
    validateMessage,
    validateUser
  };