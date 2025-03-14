# Sistema di Ticketing

Un sistema completo di ticketing con backend Node.js/Express e frontend React/Next.js.

## Caratteristiche

- Sistema di autenticazione completo con JWT
- Gestione dei ruoli (Admin, Support, Client)
- Creazione e gestione di ticket
- Chat in tempo reale tramite WebSocket
- Sistema di assegnazione dei ticket
- Notifiche in tempo reale
- Interfaccia responsive

## Requisiti di Sistema

- Node.js (v18+)
- npm
- SQLite (incluso tramite Prisma)

## Installazione

### 1. Clonare il repository

```bash
git clone <url-repository>
cd ticketing-system
```

### 2. Installare le dipendenze

#### Backend

```bash
cd backend
npm install
```

Configura il database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Configurazione

#### Backend

Crea un file `.env` nella directory `backend` con il seguente contenuto:

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="il-tuo-secret-jwt"
PORT=3001
```

#### Frontend

Crea un file `.env.local` nella directory `frontend` con il seguente contenuto:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Avvio dell'applicazione

### Avvio in modalità sviluppo

Per avviare entrambi i servizi contemporaneamente, installa concurrently:

```bash
npm install -g concurrently
```

Crea un file `start-dev.sh` nella directory principale:

```bash
#!/bin/bash
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

Rendilo eseguibile:
```bash
chmod +x start-dev.sh
```

Avvia il sistema:
```bash
./start-dev.sh
```

### Avvio separato

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

### Avvio con Docker

```bash
docker-compose up -d
```

## Accesso

Una volta avviato il sistema:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Credenziali predefinite admin **: admin@example.com / admin123

## Struttura del Progetto

### Backend
- `/backend/src/controllers`: Logica di gestione delle richieste
- `/backend/src/models`: Modelli dati e interazione con il database
- `/backend/src/routes`: Definizione delle rotte API
- `/backend/src/middlewares`: Middleware come autenticazione
- `/backend/src/services`: Logica di business
- `/backend/src/websocket`: Configurazione WebSocket

### Frontend
- `/frontend/app`: Pagine dell'applicazione (Next.js App Router)
- `/frontend/components`: Componenti riutilizzabili
- `/frontend/hooks`: Custom React hooks
- `/frontend/services`: Servizi per interazione con l'API
- `/frontend/contexts`: Contesti React per la gestione dello stato globale

## Ruoli Utente

- **ADMIN**: Accesso completo al sistema, gestione utenti
- **SUPPORT**: Gestione dei ticket e comunicazione con i clienti
- **CLIENT**: Creazione di ticket e comunicazione con il supporto

## Licenza

[MIT](LICENSE)