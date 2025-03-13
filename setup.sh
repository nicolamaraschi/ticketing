#!/bin/bash
# Script per configurare e avviare il sistema di ticketing

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Configurazione del Sistema di Ticketing ===${NC}"

# Verifica se Docker è installato
if ! command -v docker &> /dev/null; then
    echo "Docker non è installato. Per favore installa Docker prima di procedere."
    exit 1
fi

# Verifica se Docker Compose è installato
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose non è installato. Per favore installa Docker Compose prima di procedere."
    exit 1
fi

echo -e "${GREEN}Inizializzazione del backend...${NC}"
cd backend

# Installa dipendenze
echo "Installazione delle dipendenze..."
npm install

# Genera Prisma client
echo "Generazione del Prisma client..."
npx prisma generate

# Crea e applica migrazioni al database
echo "Migrazione del database..."
npx prisma migrate dev --name init

# Crea utente admin per test
echo "Creazione utente admin per testing..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Utente admin creato con successo:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Errore nella creazione dell\'utente admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
"

cd ..

echo -e "${GREEN}Inizializzazione del frontend...${NC}"
cd frontend

# Installa dipendenze
echo "Installazione delle dipendenze..."
npm install

cd ..

echo -e "${GREEN}Avvio dei container Docker...${NC}"
docker-compose up -d

echo -e "${BLUE}=== Configurazione completata ===${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend: http://localhost:3001"
echo -e "Credenziali admin: admin@example.com / admin123"