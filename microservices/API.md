# API Endpoints Documentation

## Base URL

```
# Production (via API Gateway)
http://localhost

# Development (direct service access)
User Service:    http://localhost:3001
Event Service:   http://localhost:3002
Session Service: http://localhost:3003
Speaker Service: http://localhost:3004
```

## Authentication

Most endpoints require authentication via JWT token in the header:

```http
Authorization: Bearer <access_token>
```

Tokens are issued by the **User Service** after login/registration and validated by all services.

## Roles

- `USER` - Regular user
- `ADMIN` - Administrator (full access)

---

## Authentication (User Service)

### Register User

Creates a new user account.

**Endpoint:** `POST /api/auth/register`  
**Authentication:** Not required  
**Role:** Public

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation:**
- `name`: string, required, minimum 1 character
- `email`: string, required, valid email format
- `password`: string, required, minimum 6 characters

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-11-23T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

---

### Login

Authenticates an existing user.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not required  
**Role:** Public

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

---

### Get Current User

Returns authenticated user data.

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required  
**Role:** USER/ADMIN

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2025-11-23T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Users (User Service)

### List Users

Lists all users (admins only).

**Endpoint:** `GET /api/users`  
**Authentication:** Required  
**Role:** ADMIN

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "deleted": false,
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl http://localhost/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Get User by ID

Returns specific user data.

**Endpoint:** `GET /api/users/:id`  
**Authentication:** Required  
**Role:** USER (own profile) or ADMIN

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Update User

Updates user data.

**Endpoint:** `PUT /api/users/:id`  
**Authentication:** Required  
**Role:** USER (own profile) or ADMIN

**Body:**
```json
{
  "name": "John Peter Doe",
  "email": "john.peter@example.com"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Peter Doe",
  "email": "john.peter@example.com",
  "role": "USER",
  "updatedAt": "2025-11-23T11:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Peter Doe"
  }'
```

---

### Delete User

Soft delete a user (admins only).

**Endpoint:** `DELETE /api/users/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Response (204):**
```
No content
```

**cURL Example:**
```bash
curl -X DELETE http://localhost/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Change Password

Changes the authenticated user's password.

**Endpoint:** `POST /api/users/change-password`  
**Authentication:** Required  
**Role:** USER/ADMIN

**Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
  }'
```

---

### List User Sessions

Lists sessions attended by the user.

**Endpoint:** `GET /api/users/:id/sessions`  
**Authentication:** Required  
**Role:** USER (own sessions) or ADMIN

**Query Parameters:**
- `eventId` (optional) - Filter by specific event

**Response (200):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
    "eventId": "880e8400-e29b-41d4-a716-446655440003",
    "attended": true,
    "createdAt": "2025-11-23T14:00:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl "http://localhost/api/users/550e8400-e29b-41d4-a716-446655440000/sessions?eventId=880e8400-e29b-41d4-a716-446655440003" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Mark Session Attendance

Marks user attendance at a session.

**Endpoint:** `POST /api/users/attend-session`  
**Authentication:** Required  
**Role:** USER/ADMIN

**Body:**
```json
{
  "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
  "eventId": "880e8400-e29b-41d4-a716-446655440003"
}
```

**Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "attended": true,
  "createdAt": "2025-11-23T14:00:00.000Z"
}
```

**Note:** Publishes `user.session.attended` event to RabbitMQ.

**cURL Example:**
```bash
curl -X POST http://localhost/api/users/attend-session \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
    "eventId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

---

## Events (Event Service)

### Create Event

Creates a new event (admins only).

**Endpoint:** `POST /api/events`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "name": "Tech Conference 2025",
  "organization": "EPIC Junior",
  "date": "2025-12-01T09:00:00.000Z",
  "description": "Annual technology conference",
  "logo": "https://example.com/logo.png"
}
```

**Validation:**
- `name`: string, required, minimum 1 character
- `organization`: string, required, minimum 1 character
- `date`: string (ISO 8601), required
- `description`: string, required, minimum 1 character
- `logo`: string, optional

**Response (201):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Tech Conference 2025",
  "organization": "EPIC Junior",
  "date": "2025-12-01T09:00:00.000Z",
  "description": "Annual technology conference",
  "logo": "https://example.com/logo.png",
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost/api/events \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025",
    "organization": "EPIC Junior",
    "date": "2025-12-01T09:00:00.000Z",
    "description": "Annual technology conference",
    "logo": "https://example.com/logo.png"
  }'
```

---

### List Events

Lists all active events.

**Endpoint:** `GET /api/events`  
**Authentication:** Not required  
**Role:** Public

**Response (200):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Tech Conference 2025",
    "organization": "EPIC Junior",
    "date": "2025-12-01T09:00:00.000Z",
    "description": "Annual technology conference",
    "logo": "https://example.com/logo.png",
    "deleted": false,
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z",
    "_count": {
      "userEvents": 15,
      "eventSessions": 8
    }
  }
]
```

**cURL Example:**
```bash
curl http://localhost/api/events
```

---

### Get Event by ID

Returns specific event details.

**Endpoint:** `GET /api/events/:id`  
**Authentication:** Not required  
**Role:** Public

**Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Tech Conference 2025",
  "organization": "EPIC Junior",
  "date": "2025-12-01T09:00:00.000Z",
  "description": "Annual technology conference",
  "logo": "https://example.com/logo.png",
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z",
  "eventSessions": [
    {
      "sessionId": "aa0e8400-e29b-41d4-a716-446655440005"
    }
  ],
  "userEvents": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "enrolled": true
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost/api/events/880e8400-e29b-41d4-a716-446655440003
```

---

### Update Event

Updates an existing event (admins only).

**Endpoint:** `PUT /api/events/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "name": "Tech Conference 2025 - Updated",
  "description": "New description"
}
```

**Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Tech Conference 2025 - Updated",
  "organization": "EPIC Junior",
  "date": "2025-12-01T09:00:00.000Z",
  "description": "New description",
  "logo": "https://example.com/logo.png",
  "updatedAt": "2025-11-23T11:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost/api/events/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025 - Updated"
  }'
```

---

### Delete Event

Soft delete an event (admins only).

**Endpoint:** `DELETE /api/events/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Response (204):**
```
No content
```

**cURL Example:**
```bash
curl -X DELETE http://localhost/api/events/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Enroll in Event

Enrolls the authenticated user in an event.

**Endpoint:** `POST /api/events/:id/enroll`  
**Authentication:** Required  
**Role:** USER/ADMIN

**Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "enrolled": true,
  "createdAt": "2025-11-23T11:00:00.000Z"
}
```

**Note:** Publishes `user.enrolled` event to RabbitMQ.

**cURL Example:**
```bash
curl -X POST http://localhost/api/events/880e8400-e29b-41d4-a716-446655440003/enroll \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Leave Event

Removes user enrollment from an event.

**Endpoint:** `DELETE /api/events/:id/leave`  
**Authentication:** Required  
**Role:** USER/ADMIN

**Response (204):**
```
No content
```

**cURL Example:**
```bash
curl -X DELETE http://localhost/api/events/880e8400-e29b-41d4-a716-446655440003/leave \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Sessions (Session Service)

### Create Session

Creates a new session (admins only).

**Endpoint:** `POST /api/sessions`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "name": "Introduction to TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00.000Z",
  "duration": 90,
  "time": "10:00",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "mandatory": false
}
```

**Validation:**
- `name`: string, required
- `type`: enum (`WORKSHOP`, `TALK`, `PANEL`, `NETWORKING`), required
- `local`: string, required
- `date`: string (ISO 8601), required
- `duration`: number (minutes), required
- `time`: string (HH:MM), required
- `eventId`: string (UUID), required
- `mandatory`: boolean, optional (default: false)

**Response (201):**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Introduction to TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00.000Z",
  "duration": 90,
  "time": "10:00",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "mandatory": false,
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

**Note:** Publishes `session.created` event to RabbitMQ.

**cURL Example:**
```bash
curl -X POST http://localhost/api/sessions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Introduction to TypeScript",
    "type": "WORKSHOP",
    "local": "Room A",
    "date": "2025-12-01T10:00:00.000Z",
    "duration": 90,
    "time": "10:00",
    "eventId": "880e8400-e29b-41d4-a716-446655440003",
    "mandatory": false
  }'
```

---

### List Sessions

Lists all active sessions.

**Endpoint:** `GET /api/sessions`  
**Authentication:** Not required  
**Role:** Public

**Query Parameters:**
- `eventId` (optional) - Filter by event

**Response (200):**
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "name": "Introduction to TypeScript",
    "type": "WORKSHOP",
    "local": "Room A",
    "date": "2025-12-01T10:00:00.000Z",
    "duration": 90,
    "time": "10:00",
    "eventId": "880e8400-e29b-41d4-a716-446655440003",
    "mandatory": false,
    "deleted": false
  }
]
```

**cURL Example:**
```bash
# All sessions
curl http://localhost/api/sessions

# Sessions from specific event
curl "http://localhost/api/sessions?eventId=880e8400-e29b-41d4-a716-446655440003"
```

---

### Get Session by ID

Returns specific session details.

**Endpoint:** `GET /api/sessions/:id`  
**Authentication:** Not required  
**Role:** Public

**Response (200):**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Introduction to TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00.000Z",
  "duration": 90,
  "time": "10:00",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "mandatory": false,
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z",
  "sessionSpeakers": [
    {
      "speakerId": "bb0e8400-e29b-41d4-a716-446655440006"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost/api/sessions/aa0e8400-e29b-41d4-a716-446655440005
```

---

### Update Session

Updates an existing session (admins only).

**Endpoint:** `PUT /api/sessions/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "name": "Advanced TypeScript",
  "duration": 120
}
```

**Response (200):**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Advanced TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00.000Z",
  "duration": 120,
  "time": "10:00",
  "updatedAt": "2025-11-23T11:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost/api/sessions/aa0e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced TypeScript",
    "duration": 120
  }'
```

---

### Delete Session

Soft delete a session (admins only).

**Endpoint:** `DELETE /api/sessions/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Response (204):**
```
No content
```

**cURL Example:**
```bash
curl -X DELETE http://localhost/api/sessions/aa0e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Add Speaker to Session

Associates a speaker with a session (admins only).

**Endpoint:** `POST /api/sessions/:id/speakers`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "speakerId": "bb0e8400-e29b-41d4-a716-446655440006"
}
```

**Response (201):**
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440007",
  "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
  "speakerId": "bb0e8400-e29b-41d4-a716-446655440006"
}
```

**Note:** Validates speaker via gRPC with Speaker Service.

**cURL Example:**
```bash
curl -X POST http://localhost/api/sessions/aa0e8400-e29b-41d4-a716-446655440005/speakers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "speakerId": "bb0e8400-e29b-41d4-a716-446655440006"
  }'
```

---

### Remove Speaker from Session

Removes speaker association with session (admins only).

**Endpoint:** `DELETE /api/sessions/:id/speakers/:speakerId`  
**Authentication:** Required  
**Role:** ADMIN

**Response (204):**
```
No content
```

**cURL Example:**
```bash
curl -X DELETE http://localhost/api/sessions/aa0e8400-e29b-41d4-a716-446655440005/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Speakers (Speaker Service)

### Create Speaker

Creates a new speaker (admins only).

**Endpoint:** `POST /api/speakers`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "name": "Maria Santos",
  "description": "Senior TypeScript Developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Validation:**
- `name`: string, required, minimum 1 character
- `description`: string, required, minimum 1 character
- `avatar`: string, optional

**Response (201):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Maria Santos",
  "description": "Senior TypeScript Developer",
  "avatar": "https://example.com/avatar.jpg",
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost/api/speakers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "description": "Senior TypeScript Developer",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

---

### List Speakers

Lists all active speakers.

**Endpoint:** `GET /api/speakers`  
**Authentication:** Not required  
**Role:** Public

**Response (200):**
```json
[
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "name": "Maria Santos",
    "description": "Senior TypeScript Developer",
    "avatar": "https://example.com/avatar.jpg",
    "deleted": false
  }
]
```

**cURL Example:**
```bash
curl http://localhost/api/speakers
```

---

### Get Speaker by ID

Returns specific speaker details.

**Endpoint:** `GET /api/speakers/:id`  
**Authentication:** Not required  
**Role:** Public

**Response (200):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Maria Santos",
  "description": "Senior TypeScript Developer",
  "avatar": "https://example.com/avatar.jpg",
  "deleted": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost/api/speakers/bb0e8400-e29b-41d4-a716-446655440006
```

---

### Update Speaker

Updates an existing speaker (admins only).

**Endpoint:** `PUT /api/speakers/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Body:**
```json
{
  "description": "Principal TypeScript Architect",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Maria Santos",
  "description": "Principal TypeScript Architect",
  "avatar": "https://example.com/new-avatar.jpg",
  "updatedAt": "2025-11-23T11:00:00.000Z"
}
```

**Note:** Publishes `speaker.updated` event to RabbitMQ.

**cURL Example:**
```bash
curl -X PUT http://localhost/api/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Principal TypeScript Architect"
  }'
```

---

### Delete Speaker

Soft delete a speaker (admins only).

**Endpoint:** `DELETE /api/speakers/:id`  
**Authentication:** Required  
**Role:** ADMIN

**Response (204):**
```
No content
```

**cURL Example:**
```bash
curl -X DELETE http://localhost/api/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Inter-Service Communication

### RabbitMQ (Asynchronous Messaging)

#### Event: user.enrolled
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "enrolled": true,
  "timestamp": "2025-11-23T11:00:00.000Z"
}
```
- **Publisher:** User Service
- **Consumer:** Event Service

#### Event: session.created
```json
{
  "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Introduction to TypeScript",
  "timestamp": "2025-11-23T10:00:00.000Z"
}
```
- **Publisher:** Session Service
- **Consumer:** Event Service

#### Event: speaker.updated
```json
{
  "speakerId": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Maria Santos",
  "timestamp": "2025-11-23T11:00:00.000Z"
}
```
- **Publisher:** Speaker Service
- **Consumer:** Session Service

### gRPC (Synchronous Communication)

#### Session Service (Port 50051)
```protobuf
service SessionService {
  rpc ValidateSession(SessionRequest) returns (SessionResponse);
}

message SessionRequest {
  string sessionId = 1;
}

message SessionResponse {
  bool exists = 1;
  string message = 2;
}
```

**Used by:** Event Service, User Service

#### Speaker Service (Port 50052)
```protobuf
service SpeakerService {
  rpc ValidateSpeaker(SpeakerRequest) returns (SpeakerResponse);
}

message SpeakerRequest {
  string speakerId = 1;
}

message SpeakerResponse {
  bool exists = 1;
  string message = 2;
}
```

**Used by:** Session Service

---

## Health Checks

All services expose health check endpoint:

```bash
# Via API Gateway
curl http://localhost/api/users/health
curl http://localhost/api/events/health
curl http://localhost/api/sessions/health
curl http://localhost/api/speakers/health
```

**Response (200):**
```json
{
  "status": "ok",
  "service": "user-service"
}
```

---

## Errors

### Error Format

All services return errors in the format:

```json
{
  "error": "Descriptive error message"
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

### Error Examples

**400 - Validation failed:**
```json
{
  "error": "Validation error: email must be a valid email"
}
```

**401 - Not authenticated:**
```json
{
  "error": "No token provided"
}
```

**403 - Insufficient permissions:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 - Not found:**
```json
{
  "error": "User not found"
}
```

---

## API Gateway Routing

Nginx routes requests to appropriate services:

| Route Pattern | Target Service | Port |
|---------------|----------------|------|
| `/api/auth/*` | User Service | 3001 |
| `/api/users/*` | User Service | 3001 |
| `/api/events/*` | Event Service | 3002 |
| `/api/sessions/*` | Session Service | 3003 |
| `/api/speakers/*` | Speaker Service | 3004 |

---

## Monitoring

### RabbitMQ Management UI

- **URL:** http://localhost:15672
- **Username:** admin
- **Password:** admin123

View queues, exchanges, messages and processing rate.

### Logs

```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f user-service
docker compose logs -f event-service

# Filter by error
docker compose logs | grep -i error
```

---

## Notes

- All services share the same `JWT_SECRET` for token validation
- IDs are UUIDs v4
- Timestamps in ISO 8601 format
- Soft delete: resources marked as `deleted: true` but not removed
- Eventual consistency: changes propagated via RabbitMQ may have delay
- gRPC used for critical synchronous validations
- No foreign keys between databases - integrity maintained by services