# Microservices Setup Instructions

## Quick Start (Development)

Follow these steps to get the microservices backend running in development mode:

### 1. Start Infrastructure

```bash
cd microservices
docker compose up -d user-db event-db session-db speaker-db rabbitmq
```

This starts all databases (PostgreSQL) and RabbitMQ.

### 2. Setup User Service

```bash
cd user-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on http://localhost:3001

### 3. Setup Event Service

```bash
cd event-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on http://localhost:3002

### 4. Setup Session Service

```bash
cd session-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on http://localhost:3003 (HTTP) and localhost:50051 (gRPC)

### 5. Setup Speaker Service

```bash
cd speaker-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on http://localhost:3004 (HTTP) and localhost:50052 (gRPC)

---

## Quick Start (Production)

### First Time Setup

Before deploying to production for the first time, you need to create the initial migrations for each service:

```bash
cd microservices

# Start only the databases
docker compose up -d user-db event-db session-db speaker-db

# Create migrations for each service
cd user-service
npx prisma migrate dev --name init
cd ..

cd event-service
npx prisma migrate dev --name init
cd ..

cd session-service
npx prisma migrate dev --name init
cd ..

cd speaker-service
npx prisma migrate dev --name init
cd ..

# Stop everything
docker compose down
```

### Deploy

Deploy everything with a single command:

```bash
docker compose up -d --build
```

This automatically:
- Starts all PostgreSQL databases (ports 5432-5435)
- Starts RabbitMQ (ports 5672, 15672)
- Runs database migrations for each service (`prisma migrate deploy`)
- Builds and starts all microservices:
  - User Service (port 3001)
  - Event Service (port 3002)
  - Session Service (port 3003 HTTP, 50051 gRPC)
  - Speaker Service (port 3004, 50052 gRPC)
  - API Gateway (port 80)

Access at http://localhost (via API Gateway)

---

## Service Ports

| Service | HTTP | gRPC | Database |
|---------|------|------|----------|
| User Service | 3001 | - | 5432 |
| Event Service | 3002 | - | 5433 |
| Session Service | 3003 | 50051 | 5434 |
| Speaker Service | 3004 | 50052 | 5435 |
| RabbitMQ | - | - | 5672 (15672 UI) |
| API Gateway | 80 | - | - |

---

## Docker Commands

```bash
# View logs of all services
docker compose logs -f

# View logs of specific service
docker compose logs -f user-service
docker compose logs -f event-service
docker compose logs -f session-service
docker compose logs -f speaker-service
docker compose logs -f api-gateway

# Restart a specific service
docker compose restart user-service

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v

# Rebuild and restart
docker compose up -d --build
```

---

## Troubleshooting

### Port 80 already in use

If you see "address already in use" for port 80:

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop Nginx if it's running
sudo systemctl stop nginx

# Or change the API Gateway port in docker-compose.yml
# ports:
#   - "8080:80"  # Access at http://localhost:8080
```

### Database connection issues

```bash
# Check if databases are healthy
docker compose ps

# Restart databases
docker compose restart user-db event-db session-db speaker-db

# Check database logs
docker compose logs user-db
```

### Migration errors

If migrations fail on first run:

```bash
# Stop everything
docker compose down

# Start only databases
docker compose up -d user-db event-db session-db speaker-db

# Run migrations manually for each service
cd user-service && npx prisma migrate dev --name init && cd ..
cd event-service && npx prisma migrate dev --name init && cd ..
cd session-service && npx prisma migrate dev --name init && cd ..
cd speaker-service && npx prisma migrate dev --name init && cd ..

# Now start everything
docker compose up -d
```

---

## Development Commands

Each service supports these commands:

```bash
# Development with hot-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Run tests
npm run test

# Lint code
npm run lint
```

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View logs from specific service
docker compose logs -f user-service

# Stop all services
docker compose down

# Stop and remove volumes (deletes data)
docker compose down -v

# Rebuild specific service
docker compose up -d --build user-service

# View status
docker compose ps
```

---

## Database Access

```bash
# User Service DB
docker compose exec user-db psql -U user_service -d user_db

# Event Service DB
docker compose exec event-db psql -U event_service -d event_db

# Session Service DB
docker compose exec session-db psql -U session_service -d session_db

# Speaker Service DB
docker compose exec speaker-db psql -U speaker_service -d speaker_db
```