const { PrismaClient } = require('@prisma/client');

// Crea un'istanza del client Prisma
const prisma = new PrismaClient();

// Funzione per l'inizializzazione del database
const initDatabase = async () => {
  try {
    // Verifica la connessione al database
    await prisma.$connect();
    console.log('Database connesso con successo');
    
    // Qui puoi aggiungere qualsiasi logica di inizializzazione aggiuntiva
    // Ad esempio, creare l'utente admin iniziale se non esiste

    return prisma;
  } catch (error) {
    console.error('Errore durante la connessione al database:', error);
    throw error;
  }
};

// Funzione per chiudere la connessione al database
const closeDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('Connessione al database chiusa');
  } catch (error) {
    console.error('Errore durante la chiusura della connessione al database:', error);
    throw error;
  }
};

// Funzione per creare l'utente admin se non esiste
const createInitialAdmin = async () => {
  try {
    const bcrypt = require('bcrypt');
    
    // Controlla se esiste già un admin
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    // Se non esiste, crea l'admin predefinito
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('Utente admin creato con successo');
    }
  } catch (error) {
    console.error('Errore durante la creazione dell\'utente admin:', error);
  }
};

module.exports = {
  prisma,
  initDatabase,
  closeDatabase,
  createInitialAdmin
};