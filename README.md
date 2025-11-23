# Backend Architecture Comparison - Monolith vs Microservices

This project demonstrates two different backend architectures for an event management system:
- **Monolithic Architecture** - Traditional single application approach
- **Microservices Architecture** - Distributed system with independent services

## Project Structure

- `/diagrams` - Architecture diagrams and communication flows (Mermaid)
- `/monolith` - Monolithic implementation (single codebase, single database)
- `/microservices` - Microservices implementation (4 services, 4 databases, RabbitMQ, gRPC)

## Features

### User Management
- **User Registration** - Create account with email/password
- **User Login** - JWT-based authentication
- **Profile Management** - View and update own profile
- **Password Change** - Secure password updates
- **User Listings** - Admin can list all users
- **Soft Delete** - Users marked as deleted, not removed

### Event Management
- **Create Events** - Admins can create new events
- **List Events** - Public access to all active events
- **Event Details** - View full event info with sessions and speakers
- **Update Events** - Admins can modify event details
- **Delete Events** - Soft delete with data preservation
- **Event Enrollment** - Users can enroll/leave events
- **Enrollment Tracking** - View all enrolled users

### Session Management
- **Create Sessions** - Link sessions to events
- **Session Types** - WORKSHOP, TALK, PANEL, NETWORKING
- **List Sessions** - Filter by event
- **Session Details** - Full info with speakers and attendees
- **Update Sessions** - Modify session information
- **Delete Sessions** - Soft delete support
- **Speaker Assignment** - Add/remove speakers to sessions
- **Attendance Tracking** - Mark user attendance

### Speaker Management
- **Create Speakers** - Add speaker profiles
- **List Speakers** - View all speaker profiles
- **Speaker Details** - Full bio with session history
- **Update Speakers** - Modify speaker information
- **Delete Speakers** - Soft delete support
- **Session Linking** - Track speaker sessions

### Security & Authentication
- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Tokens** - Access (15min) + Refresh (7d) tokens
- **Role-Based Access Control** - USER/ADMIN roles
- **Input Validation** - Zod schemas on all endpoints
- **Security Headers** - Helmet.js protection
- **CORS** - Cross-origin resource sharing
- **Protected Routes** - Middleware-based auth
- **Permission Checks** - Granular access control

### Technical Features
- **TypeScript** - Full type safety
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **Error Handling** - Centralized error middleware
- **Winston Logging** - File and console logs
- **Docker Support** - Containerized deployment
- **Hot Reload** - Development with ts-node-dev
- **API Documentation** - Complete endpoint docs

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Logging:** Winston
- **Containerization:** Docker

### Additional (Microservices only)
- **Message Broker:** RabbitMQ
- **RPC:** gRPC
- **API Gateway:** Nginx