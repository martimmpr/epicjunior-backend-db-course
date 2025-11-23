# API Endpoints Documentation

## Overview

### Base URL
```
http://localhost:3000
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Response Format
All responses are in JSON format.

**Success Response:**
```json
{
  // Response data varies by endpoint
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication Module

### POST /auth/register

Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- `name`: String, minimum 2 characters
- `email`: Valid email format
- `password`: Minimum 8 characters, must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

**Success Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

---

### POST /auth/login

Login with email and password.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Expiration:**
- `accessToken`: 15 minutes
- `refreshToken`: 7 days

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

---

### GET /auth/me

Get current authenticated user profile.

**Access:** Private (requires valid JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid or expired token!"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Users Module

### GET /users

List all users in the system.

**Access:** Private (Admin only)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Admin",
    "email": "jane@example.com",
    "role": "ADMIN",
    "createdAt": "2025-11-22T09:00:00.000Z",
    "updatedAt": "2025-11-22T09:00:00.000Z"
  }
]
```

**Error Response (403):**
```json
{
  "error": "Admin access required!"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### GET /users/:id

Get detailed information about a specific user.

**Access:** Private (own profile or admin)

**URL Parameters:**
- `id` (string, UUID): User ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z",
  "userEvents": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "enrolled": true,
      "createdAt": "2025-11-23T11:00:00.000Z",
      "event": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "Tech Conference 2025",
        "date": "2025-12-01T09:00:00.000Z",
        "organization": "EPIC Júnior"
      }
    }
  ],
  "userSessions": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "attended": true,
      "createdAt": "2025-11-23T12:00:00.000Z",
      "session": {
        "id": "aa0e8400-e29b-41d4-a716-446655440005",
        "name": "Introduction to TypeScript",
        "type": "WORKSHOP",
        "date": "2025-12-01T10:00:00.000Z"
      }
    }
  ]
}
```

**Error Response (403):**
```json
{
  "error": "You can only view your own profile"
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### PUT /users/:id

Update user profile information.

**Access:** Private (own profile or admin)

**URL Parameters:**
- `id` (string, UUID): User ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "ADMIN"
}
```

**Body Fields (all optional):**
- `name` (string, min 2 chars): New name
- `email` (string, valid email): New email
- `role` (string, "USER" | "ADMIN"): New role (admin only)

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "ADMIN",
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T13:00:00.000Z"
}
```

**Error Response (403):**
```json
{
  "error": "Only admins can change user roles"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated"
  }'
```

---

### DELETE /users/:id

Soft delete a user (marks as deleted, doesn't remove from database).

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): User ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (204):**
No content

**Error Response (403):**
```json
{
  "error": "Admin access required!"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### POST /users/change-password

Change current user's password.

**Access:** Private

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Validation Rules:**
- `currentPassword`: Required
- `newPassword`: Minimum 8 characters, must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Current password is incorrect"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
  }'
```

---

### GET /users/:id/events

Get all events a user is enrolled in.

**Access:** Private (own events or admin)

**URL Parameters:**
- `id` (string, UUID): User ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "880e8400-e29b-41d4-a716-446655440003",
    "enrolled": true,
    "createdAt": "2025-11-23T11:00:00.000Z",
    "event": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Tech Conference 2025",
      "organization": "EPIC Júnior",
      "date": "2025-12-01T09:00:00.000Z",
      "description": "Annual technology conference",
      "logo": "https://example.com/logo.png"
    }
  }
]
```

**Error Response (403):**
```json
{
  "error": "You can only view your own events"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### GET /users/:id/sessions

Get all sessions a user has attended.

**Access:** Private (own sessions or admin)

**URL Parameters:**
- `id` (string, UUID): User ID

**Query Parameters:**
- `eventId` (string, UUID, optional): Filter sessions by event

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
    "eventId": "880e8400-e29b-41d4-a716-446655440003",
    "attended": true,
    "createdAt": "2025-11-23T12:00:00.000Z",
    "session": {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "name": "Introduction to TypeScript",
      "type": "WORKSHOP",
      "local": "Room A",
      "date": "2025-12-01T10:00:00.000Z",
      "duration": 120,
      "time": "10:00",
      "event": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "Tech Conference 2025",
        "date": "2025-12-01T09:00:00.000Z"
      },
      "sessionSpeakers": [
        {
          "speaker": {
            "id": "bb0e8400-e29b-41d4-a716-446655440006",
            "name": "Dr. Sarah Johnson",
            "avatar": "https://example.com/avatar.jpg"
          }
        }
      ]
    }
  }
]
```

**Example:**
```bash
# Get all sessions
curl -X GET http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by event
curl -X GET "http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/sessions?eventId=880e8400-e29b-41d4-a716-446655440003" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Events Module

### POST /events

Create a new event.

**Access:** Private (Admin only)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tech Conference 2025",
  "organization": "EPIC Júnior",
  "date": "2025-12-01T09:00:00Z",
  "logo": "https://example.com/logo.png",
  "description": "Annual technology conference featuring the latest trends"
}
```

**Validation Rules:**
- `name` (string): Minimum 3 characters, required
- `organization` (string): Minimum 3 characters, required
- `date` (string): ISO 8601 datetime format, required
- `logo` (string): Valid URL, optional
- `description` (string): Minimum 10 characters, required

**Success Response (201):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Tech Conference 2025",
  "organization": "EPIC Júnior",
  "date": "2025-12-01T09:00:00.000Z",
  "logo": "https://example.com/logo.png",
  "description": "Annual technology conference featuring the latest trends",
  "deleted": false,
  "createdAt": "2025-11-23T14:00:00.000Z",
  "updatedAt": "2025-11-23T14:00:00.000Z"
}
```

**Error Response (403):**
```json
{
  "error": "Admin access required!"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025",
    "organization": "EPIC Júnior",
    "date": "2025-12-01T09:00:00Z",
    "description": "Annual technology conference"
  }'
```

---

### GET /events

List all active events.

**Access:** Public

**Success Response (200):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Tech Conference 2025",
    "organization": "EPIC Júnior",
    "date": "2025-12-01T09:00:00.000Z",
    "logo": "https://example.com/logo.png",
    "description": "Annual technology conference",
    "deleted": false,
    "createdAt": "2025-11-23T14:00:00.000Z",
    "updatedAt": "2025-11-23T14:00:00.000Z",
    "_count": {
      "userEvents": 45,
      "sessions": 12
    }
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:3000/events
```

---

### GET /events/:id

Get detailed information about a specific event.

**Access:** Public

**URL Parameters:**
- `id` (string, UUID): Event ID

**Success Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Tech Conference 2025",
  "organization": "EPIC Júnior",
  "date": "2025-12-01T09:00:00.000Z",
  "logo": "https://example.com/logo.png",
  "description": "Annual technology conference",
  "deleted": false,
  "createdAt": "2025-11-23T14:00:00.000Z",
  "updatedAt": "2025-11-23T14:00:00.000Z",
  "sessions": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "name": "Introduction to TypeScript",
      "type": "WORKSHOP",
      "local": "Room A",
      "date": "2025-12-01T10:00:00.000Z",
      "duration": 120,
      "time": "10:00",
      "mandatory": false,
      "sessionSpeakers": [
        {
          "speaker": {
            "id": "bb0e8400-e29b-41d4-a716-446655440006",
            "name": "Dr. Sarah Johnson",
            "avatar": "https://example.com/avatar.jpg",
            "description": "TypeScript expert with 10 years of experience"
          }
        }
      ]
    }
  ],
  "userEvents": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "enrolled": true,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Event not found"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/events/880e8400-e29b-41d4-a716-446655440003
```

---

### PUT /events/:id

Update an existing event.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Event ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Tech Conference 2025 - Updated",
  "organization": "EPIC Júnior",
  "date": "2025-12-02T09:00:00Z",
  "logo": "https://example.com/new-logo.png",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Tech Conference 2025 - Updated",
  "organization": "EPIC Júnior",
  "date": "2025-12-02T09:00:00.000Z",
  "logo": "https://example.com/new-logo.png",
  "description": "Updated description",
  "deleted": false,
  "createdAt": "2025-11-23T14:00:00.000Z",
  "updatedAt": "2025-11-23T15:00:00.000Z"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/events/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025 - Updated"
  }'
```

---

### DELETE /events/:id

Soft delete an event.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Event ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (204):**
No content

**Example:**
```bash
curl -X DELETE http://localhost:3000/events/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### POST /events/:id/enroll

Enroll current user in an event.

**Access:** Private

**URL Parameters:**
- `id` (string, UUID): Event ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "enrolled": true,
  "createdAt": "2025-11-23T16:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Already enrolled in this event"
}
```

**Error Response (404):**
```json
{
  "error": "Event not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/events/880e8400-e29b-41d4-a716-446655440003/enroll \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### DELETE /events/:id/leave

Remove current user's enrollment from an event.

**Access:** Private

**URL Parameters:**
- `id` (string, UUID): Event ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (204):**
No content

**Error Response (404):**
```json
{
  "error": "Enrollment not found"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/events/880e8400-e29b-41d4-a716-446655440003/leave \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Sessions Module

### POST /sessions

Create a new session for an event.

**Access:** Private (Admin only)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Introduction to TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00Z",
  "duration": 120,
  "time": "10:00",
  "mandatory": false,
  "eventId": "880e8400-e29b-41d4-a716-446655440003"
}
```

**Validation Rules:**
- `name` (string): Minimum 3 characters, required
- `type` (string): One of "WORKSHOP", "TALK", "PANEL", "NETWORKING", required
- `local` (string): Minimum 2 characters, required
- `date` (string): ISO 8601 datetime format, required
- `duration` (number): Positive integer (minutes), required
- `time` (string): HH:MM format, required
- `mandatory` (boolean): Optional, default false
- `eventId` (string, UUID): Required

**Success Response (201):**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Introduction to TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00.000Z",
  "duration": 120,
  "time": "10:00",
  "mandatory": false,
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "deleted": false,
  "createdAt": "2025-11-23T17:00:00.000Z",
  "updatedAt": "2025-11-23T17:00:00.000Z",
  "event": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Tech Conference 2025",
    "organization": "EPIC Júnior",
    "date": "2025-12-01T09:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Introduction to TypeScript",
    "type": "WORKSHOP",
    "local": "Room A",
    "date": "2025-12-01T10:00:00Z",
    "duration": 120,
    "time": "10:00",
    "eventId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

---

### GET /sessions

List all sessions, optionally filtered by event.

**Access:** Public

**Query Parameters:**
- `eventId` (string, UUID, optional): Filter sessions by event

**Success Response (200):**
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "name": "Introduction to TypeScript",
    "type": "WORKSHOP",
    "local": "Room A",
    "date": "2025-12-01T10:00:00.000Z",
    "duration": 120,
    "time": "10:00",
    "mandatory": false,
    "eventId": "880e8400-e29b-41d4-a716-446655440003",
    "deleted": false,
    "createdAt": "2025-11-23T17:00:00.000Z",
    "updatedAt": "2025-11-23T17:00:00.000Z",
    "event": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Tech Conference 2025",
      "date": "2025-12-01T09:00:00.000Z"
    },
    "sessionSpeakers": [
      {
        "speaker": {
          "id": "bb0e8400-e29b-41d4-a716-446655440006",
          "name": "Dr. Sarah Johnson",
          "avatar": "https://example.com/avatar.jpg",
          "description": "TypeScript expert"
        }
      }
    ],
    "_count": {
      "userSessions": 25
    }
  }
]
```

**Example:**
```bash
# Get all sessions
curl -X GET http://localhost:3000/sessions

# Filter by event
curl -X GET "http://localhost:3000/sessions?eventId=880e8400-e29b-41d4-a716-446655440003"
```

---

### GET /sessions/:id

Get detailed information about a specific session.

**Access:** Public

**URL Parameters:**
- `id` (string, UUID): Session ID

**Success Response (200):**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Introduction to TypeScript",
  "type": "WORKSHOP",
  "local": "Room A",
  "date": "2025-12-01T10:00:00.000Z",
  "duration": 120,
  "time": "10:00",
  "mandatory": false,
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "deleted": false,
  "createdAt": "2025-11-23T17:00:00.000Z",
  "updatedAt": "2025-11-23T17:00:00.000Z",
  "event": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Tech Conference 2025",
    "organization": "EPIC Júnior",
    "date": "2025-12-01T09:00:00.000Z",
    "logo": "https://example.com/logo.png",
    "description": "Annual technology conference"
  },
  "sessionSpeakers": [
    {
      "speaker": {
        "id": "bb0e8400-e29b-41d4-a716-446655440006",
        "name": "Dr. Sarah Johnson",
        "avatar": "https://example.com/avatar.jpg",
        "description": "TypeScript expert with 10 years of experience"
      }
    }
  ],
  "userSessions": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "attended": true,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Session not found"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/sessions/aa0e8400-e29b-41d4-a716-446655440005
```

---

### PUT /sessions/:id

Update an existing session.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Session ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Advanced TypeScript",
  "type": "TALK",
  "local": "Room B",
  "date": "2025-12-01T14:00:00Z",
  "duration": 90,
  "time": "14:00",
  "mandatory": true
}
```

**Success Response (200):**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Advanced TypeScript",
  "type": "TALK",
  "local": "Room B",
  "date": "2025-12-01T14:00:00.000Z",
  "duration": 90,
  "time": "14:00",
  "mandatory": true,
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "deleted": false,
  "createdAt": "2025-11-23T17:00:00.000Z",
  "updatedAt": "2025-11-23T18:00:00.000Z",
  "event": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Tech Conference 2025"
  }
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/sessions/aa0e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced TypeScript",
    "duration": 90
  }'
```

---

### DELETE /sessions/:id

Soft delete a session.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Session ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (204):**
No content

**Example:**
```bash
curl -X DELETE http://localhost:3000/sessions/aa0e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### POST /sessions/:id/speakers/:speakerId

Add a speaker to a session.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Session ID
- `speakerId` (string, UUID): Speaker ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (201):**
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440007",
  "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
  "speakerId": "bb0e8400-e29b-41d4-a716-446655440006",
  "speaker": {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "name": "Dr. Sarah Johnson",
    "avatar": "https://example.com/avatar.jpg",
    "description": "TypeScript expert"
  },
  "session": {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "name": "Introduction to TypeScript",
    "type": "WORKSHOP",
    "date": "2025-12-01T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Speaker already added to this session"
}
```

**Error Response (404):**
```json
{
  "error": "Session not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/sessions/aa0e8400-e29b-41d4-a716-446655440005/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### DELETE /sessions/:id/speakers/:speakerId

Remove a speaker from a session.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Session ID
- `speakerId` (string, UUID): Speaker ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (204):**
No content

**Example:**
```bash
curl -X DELETE http://localhost:3000/sessions/aa0e8400-e29b-41d4-a716-446655440005/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### POST /sessions/:id/attend

Mark attendance for a session.

**Access:** Private

**URL Parameters:**
- `id` (string, UUID): Session ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventId": "880e8400-e29b-41d4-a716-446655440003"
}
```

**Success Response (201):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "aa0e8400-e29b-41d4-a716-446655440005",
  "eventId": "880e8400-e29b-41d4-a716-446655440003",
  "attended": true,
  "createdAt": "2025-11-23T19:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "eventId is required"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/sessions/aa0e8400-e29b-41d4-a716-446655440005/attend \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

---

## Speakers Module

### POST /speakers

Create a new speaker profile.

**Access:** Private (Admin only)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Dr. Sarah Johnson",
  "avatar": "https://example.com/avatar.jpg",
  "description": "TypeScript expert with 10 years of experience in web development"
}
```

**Validation Rules:**
- `name` (string): Minimum 3 characters, required
- `avatar` (string): Valid URL, optional
- `description` (string): Minimum 10 characters, required

**Success Response (201):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Dr. Sarah Johnson",
  "avatar": "https://example.com/avatar.jpg",
  "description": "TypeScript expert with 10 years of experience in web development",
  "deleted": false,
  "createdAt": "2025-11-23T20:00:00.000Z",
  "updatedAt": "2025-11-23T20:00:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/speakers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Johnson",
    "avatar": "https://example.com/avatar.jpg",
    "description": "TypeScript expert with 10 years of experience"
  }'
```

---

### GET /speakers

List all speakers.

**Access:** Public

**Success Response (200):**
```json
[
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "name": "Dr. Sarah Johnson",
    "avatar": "https://example.com/avatar.jpg",
    "description": "TypeScript expert",
    "deleted": false,
    "createdAt": "2025-11-23T20:00:00.000Z",
    "updatedAt": "2025-11-23T20:00:00.000Z",
    "sessionSpeakers": [
      {
        "session": {
          "id": "aa0e8400-e29b-41d4-a716-446655440005",
          "name": "Introduction to TypeScript",
          "type": "WORKSHOP",
          "date": "2025-12-01T10:00:00.000Z",
          "event": {
            "id": "880e8400-e29b-41d4-a716-446655440003",
            "name": "Tech Conference 2025",
            "date": "2025-12-01T09:00:00.000Z"
          }
        }
      }
    ],
    "_count": {
      "sessionSpeakers": 3
    }
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:3000/speakers
```

---

### GET /speakers/:id

Get detailed information about a specific speaker.

**Access:** Public

**URL Parameters:**
- `id` (string, UUID): Speaker ID

**Success Response (200):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Dr. Sarah Johnson",
  "avatar": "https://example.com/avatar.jpg",
  "description": "TypeScript expert with 10 years of experience in web development and teaching",
  "deleted": false,
  "createdAt": "2025-11-23T20:00:00.000Z",
  "updatedAt": "2025-11-23T20:00:00.000Z",
  "sessionSpeakers": [
    {
      "session": {
        "id": "aa0e8400-e29b-41d4-a716-446655440005",
        "name": "Introduction to TypeScript",
        "type": "WORKSHOP",
        "local": "Room A",
        "date": "2025-12-01T10:00:00.000Z",
        "duration": 120,
        "time": "10:00",
        "event": {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "name": "Tech Conference 2025",
          "organization": "EPIC Júnior",
          "date": "2025-12-01T09:00:00.000Z",
          "logo": "https://example.com/logo.png"
        }
      }
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Speaker not found"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/speakers/bb0e8400-e29b-41d4-a716-446655440006
```

---

### PUT /speakers/:id

Update an existing speaker profile.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Speaker ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Dr. Sarah Johnson, PhD",
  "avatar": "https://example.com/new-avatar.jpg",
  "description": "Updated description with more details"
}
```

**Success Response (200):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "Dr. Sarah Johnson, PhD",
  "avatar": "https://example.com/new-avatar.jpg",
  "description": "Updated description with more details",
  "deleted": false,
  "createdAt": "2025-11-23T20:00:00.000Z",
  "updatedAt": "2025-11-23T21:00:00.000Z"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Johnson, PhD"
  }'
```

---

### DELETE /speakers/:id

Soft delete a speaker.

**Access:** Private (Admin only)

**URL Parameters:**
- `id` (string, UUID): Speaker ID

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (204):**
No content

**Example:**
```bash
curl -X DELETE http://localhost:3000/speakers/bb0e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```