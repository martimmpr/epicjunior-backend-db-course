# Microservices Setup Instructions

## Quick Start (Development)

This is the recommended development workflow where infrastructure (databases, RabbitMQ, and API Gateway) runs in Docker, but services run locally for easier development and debugging.

### 1. Start Infrastructure with Docker

```bash
cd microservices
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL Databases** (user-db, event-db, session-db, speaker-db)
- **RabbitMQ** (message broker)
- **API Gateway** (nginx configured to proxy to localhost)

### 2. Setup and Start User Service

```bash
cd user-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on **http://localhost:3001**

### 3. Setup and Start Event Service

```bash
cd event-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on **http://localhost:3002**

### 4. Setup and Start Session Service

```bash
cd session-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on **http://localhost:3003** (HTTP) and **localhost:50051** (gRPC)

### 5. Setup and Start Speaker Service

```bash
cd speaker-service
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The service will start on **http://localhost:3004** (HTTP) and **localhost:50052** (gRPC)

### 6. Test the API

All endpoints are available through the API Gateway at:
**http://localhost:8080**

Examples:
- `POST http://localhost:8080/api/auth/register`
- `POST http://localhost:8080/api/auth/login`
- `GET http://localhost:8080/api/users/`
- `GET http://localhost:8080/api/events/`
- `GET http://localhost:8080/api/sessions/`
- `GET http://localhost:8080/api/speakers/`

> **Note**: The API Gateway (nginx) is configured in `docker-compose.dev.yml` to proxy requests to `host.docker.internal`, allowing it to access services running locally on your machine.

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
  - API Gateway (port 8080)

Access at **http://localhost:8080** (via API Gateway)

## Service Ports

| Service | HTTP | gRPC | Database |
|---------|------|------|----------|
| User Service | 3001 | - | 5432 |
| Event Service | 3002 | - | 5433 |
| Session Service | 3003 | 50051 | 5434 |
| Speaker Service | 3004 | 50052 | 5435 |
| RabbitMQ | - | - | 5672 (15672 UI) |
| API Gateway | 8080 | - | - |

## Docker Commands

### Development Mode

```bash
# View logs from infrastructure
docker compose -f docker-compose.dev.yml logs -f

# View logs from API Gateway
docker compose -f docker-compose.dev.yml logs -f api-gateway

# View logs from a specific database
docker compose -f docker-compose.dev.yml logs -f user-db

# Restart API Gateway (after changing nginx.dev.conf)
docker compose -f docker-compose.dev.yml restart api-gateway

# Stop all infrastructure
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes all data)
docker compose -f docker-compose.dev.yml down -v
```

### Production Mode

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

## Troubleshooting

### Port 8080 already in use

If you see "address already in use" for port 8080:

```bash
# Check what's using port 8080
sudo lsof -i :8080

# Or change the API Gateway port in docker-compose.dev.yml
# ports:
#   - "3000:80"  # Access at http://localhost:3000
```

### "Couldn't connect to server" error in API Gateway

If the API Gateway cannot connect to services:

1. Verify services are running locally (npm run dev)
2. Verify `docker-compose.dev.yml` is using `Dockerfile.dev`
3. Check logs: `docker compose -f docker-compose.dev.yml logs api-gateway`

### Database connection issues

```bash
# Check if databases are healthy
docker compose -f docker-compose.dev.yml ps

# Restart databases
docker compose -f docker-compose.dev.yml restart user-db event-db session-db speaker-db

# Check database logs
docker compose -f docker-compose.dev.yml logs user-db
```

### Migration errors

If migrations fail on first run:

```bash
# Stop everything
docker compose -f docker-compose.dev.yml down

# Start only databases
docker compose -f docker-compose.dev.yml up -d user-db event-db session-db speaker-db

# Run migrations manually for each service
cd user-service && npx prisma migrate dev --name init && cd ..
cd event-service && npx prisma migrate dev --name init && cd ..
cd session-service && npx prisma migrate dev --name init && cd ..
cd speaker-service && npx prisma migrate dev --name init && cd ..

# Now start everything
docker compose -f docker-compose.dev.yml up -d
```

### Service not connecting to RabbitMQ

```bash
# Check if RabbitMQ is running
docker compose -f docker-compose.dev.yml ps rabbitmq

# View RabbitMQ logs
docker compose -f docker-compose.dev.yml logs rabbitmq

# Access management interface
# http://localhost:15672 (user: admin, password: admin123)
```

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