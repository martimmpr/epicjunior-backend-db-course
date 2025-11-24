# Microservices Setup Instructions

## Quick Start (Development)

Follow these steps to get the microservices backend running:

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

Deploy everything with a single command:

```bash
docker compose up -d
```

This automatically:
- Starts all databases (PostgreSQL)
- Starts RabbitMQ message broker
- Runs database migrations for all services
- Builds and starts all microservices
- Starts the API Gateway (Nginx)

Access the API at http://localhost

**IMPORTANT:** Change `JWT_SECRET` in production!

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