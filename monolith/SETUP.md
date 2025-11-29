# Monolith Setup Instructions

## Quick Start (Development)

Follow these steps to get the monolithic backend running:

### 1. Install Dependencies

```bash
cd monolith
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

### 3. Start PostgreSQL Database

```bash
docker compose up -d postgres
```

Update `.env` with your local connection string.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on `prisma/schema.prisma`.

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

---

## Quick Start (Production)

### First Time Setup

Before deploying to production for the first time, you need to create the initial migration:

```bash
# Start only the database
docker compose up -d postgres

# Create initial migration (only needed once)
npx prisma migrate dev --name init

# Stop the database
docker compose down
```

### Deploy

Deploy everything with a single command:

```bash
docker compose up -d --build
```

This automatically:
- Starts PostgreSQL database (port 5432)
- Runs database migrations (`prisma migrate deploy`)
- Builds and starts the application (port 3000)

Access at http://localhost:3000

---

## Development Commands

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