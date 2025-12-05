# Database Schemas

This document provides detailed entity-relationship diagrams for both monolithic and microservices database designs.

## Monolithic Architecture - Single Database

### Complete ER Diagram

```mermaid
erDiagram
    User ||--o{ UserEvent : enrolls
    User ||--o{ UserSession : attends
    Event ||--o{ UserEvent : has
    Event ||--o{ Session : contains
    Event ||--o{ EventSession : links
    Session ||--o{ EventSession : belongs
    Session ||--o{ UserSession : tracks
    Session ||--o{ SessionSpeaker : features
    Speaker ||--o{ SessionSpeaker : presents
    
    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    Event {
        uuid id PK
        string name
        string organization
        datetime date
        string logo
        string description
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    Session {
        uuid id PK
        string name
        enum type
        string local
        datetime date
        int duration
        string time
        boolean mandatory
        uuid eventId FK
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    Speaker {
        uuid id PK
        string name
        string avatar
        string description
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    UserEvent {
        uuid id PK
        uuid userId FK
        uuid eventId FK
        boolean enrolled
        timestamp createdAt
    }
    
    UserSession {
        uuid id PK
        uuid userId FK
        uuid sessionId FK
        uuid eventId FK
        boolean attended
        timestamp createdAt
    }
    
    EventSession {
        uuid id PK
        uuid eventId FK
        uuid sessionId FK
    }
    
    SessionSpeaker {
        uuid id PK
        uuid sessionId FK
        uuid speakerId FK
    }
```

### Table Details

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hash
    role VARCHAR(20) DEFAULT 'USER', -- USER, ADMIN
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted ON users(deleted);
```

#### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    logo VARCHAR(500),
    description TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_deleted ON events(deleted);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- WORKSHOP, TALK, PANEL, NETWORKING
    local VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    duration INT NOT NULL, -- minutes
    time VARCHAR(10) NOT NULL, -- HH:MM format
    mandatory BOOLEAN DEFAULT FALSE,
    event_id UUID NOT NULL REFERENCES events(id),
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_event ON sessions(event_id);
CREATE INDEX idx_sessions_type ON sessions(type);
CREATE INDEX idx_sessions_deleted ON sessions(deleted);
```

#### Speakers Table
```sql
CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    description TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_speakers_deleted ON speakers(deleted);
```

#### Junction Tables

```sql
-- User enrollment in events
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    enrolled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- User attendance in sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL REFERENCES sessions(id),
    event_id UUID NOT NULL,
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Event-Session relationship
CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    session_id UUID NOT NULL,
    UNIQUE(event_id, session_id)
);

-- Session-Speaker relationship
CREATE TABLE session_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    speaker_id UUID NOT NULL REFERENCES speakers(id),
    UNIQUE(session_id, speaker_id)
);
```

---

## Microservices Architecture - Distributed Databases

### Database Per Service Pattern

```mermaid
graph TB
    subgraph "User Service Database"
        UT["<b>users table</b>"]
        UST["<b>user_sessions table</b>"]
    end
    
    subgraph "Event Service Database"
        ET["<b>events table</b>"]
        UET["<b>user_events table</b>"]
        EST["<b>event_sessions table</b>"]
    end
    
    subgraph "Session Service Database"
        ST["<b>sessions table</b>"]
        SST["<b>session_speakers table</b>"]
    end
    
    subgraph "Speaker Service Database"
        SpT["<b>speakers table</b>"]
    end
    
    UST -.->|References userId<br/>No FK constraint| UT
    UET -.->|References userId<br/>No FK constraint| UT
    UST -.->|References sessionId<br/>No FK constraint| ST
    EST -.->|References sessionId<br/>No FK constraint| ST
    SST -.->|References speakerId<br/>No FK constraint| SpT
    
    style UT fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style UST fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style ET fill:#3498db,stroke:#2980b9,stroke-width:3px,color:#fff
    style UET fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style EST fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ST fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#fff
    style SST fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    style SpT fill:#f39c12,stroke:#d68910,stroke-width:3px,color:#000
```

### 1. User Service Database

```mermaid
erDiagram
    User ||--o{ UserSession : tracks
    
    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    UserSession {
        uuid id PK
        uuid userId FK
        uuid sessionId "Reference only"
        uuid eventId "Reference only"
        boolean attended
        timestamp createdAt
    }
```

**Schema:**
```sql
-- User Service Database (Port 5432)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL, -- No FK to sessions (different DB)
    event_id UUID NOT NULL,   -- No FK to events (different DB)
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
```

**Data Ownership:**
- User accounts and authentication
- User session attendance tracking

---

### 2. Event Service Database

```mermaid
erDiagram
    Event ||--o{ UserEvent : has
    Event ||--o{ EventSession : links
    
    Event {
        uuid id PK
        string name
        string organization
        datetime date
        string logo
        string description
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    UserEvent {
        uuid id PK
        uuid userId "Reference only"
        uuid eventId FK
        boolean enrolled
        timestamp createdAt
    }
    
    EventSession {
        uuid id PK
        uuid eventId FK
        uuid sessionId "Reference only"
    }
```

**Schema:**
```sql
-- Event Service Database (Port 5433)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    logo VARCHAR(500),
    description TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- No FK to users (different DB)
    event_id UUID NOT NULL REFERENCES events(id),
    enrolled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    session_id UUID NOT NULL, -- No FK to sessions (different DB)
    UNIQUE(event_id, session_id)
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_user_events_user ON user_events(user_id);
CREATE INDEX idx_user_events_event ON user_events(event_id);
```

**Data Ownership:**
- Event information
- User enrollments in events
- Event-session associations

---

### 3. Session Service Database

```mermaid
erDiagram
    Session ||--o{ SessionSpeaker : features
    
    Session {
        uuid id PK
        string name
        enum type
        string local
        datetime date
        int duration
        string time
        boolean mandatory
        uuid eventId "Reference only"
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    SessionSpeaker {
        uuid id PK
        uuid sessionId FK
        uuid speakerId "Reference only"
    }
```

**Schema:**
```sql
-- Session Service Database (Port 5434)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    local VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    duration INT NOT NULL,
    time VARCHAR(10) NOT NULL,
    mandatory BOOLEAN DEFAULT FALSE,
    event_id UUID NOT NULL, -- No FK to events (different DB)
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    speaker_id UUID NOT NULL, -- No FK to speakers (different DB)
    UNIQUE(session_id, speaker_id)
);

CREATE INDEX idx_sessions_event ON sessions(event_id);
CREATE INDEX idx_sessions_type ON sessions(type);
CREATE INDEX idx_session_speakers_session ON session_speakers(session_id);
```

**Data Ownership:**
- Session details (workshops, talks, panels, networking)
- Session-speaker associations

---

### 4. Speaker Service Database

```mermaid
erDiagram
    Speaker {
        uuid id PK
        string name
        string avatar
        string description
        boolean deleted
        timestamp createdAt
        timestamp updatedAt
    }
```

**Schema:**
```sql
-- Speaker Service Database (Port 5435)
CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    description TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_speakers_deleted ON speakers(deleted);
```

**Data Ownership:**
- Speaker profiles
- Speaker information

---

## Data Consistency Patterns

### Monolithic - ACID Transactions

```mermaid
sequenceDiagram
    participant App as Application
    participant DB as Single Database
    
    App->>DB: BEGIN TRANSACTION
    App->>DB: INSERT INTO events
    App->>DB: INSERT INTO sessions
    App->>DB: INSERT INTO event_sessions
    App->>DB: COMMIT
    
    Note over DB: All operations succeed<br/>or all fail together<br/>(Atomicity)
```

### Microservices - Eventual Consistency

```mermaid
sequenceDiagram
    participant ES as Event Service
    participant EDB as Event DB
    participant MQ as Message Queue
    participant SS as Session Service
    participant SDB as Session DB
    
    ES->>EDB: INSERT INTO events
    EDB-->>ES: Event created (id: 123)
    
    ES->>MQ: Publish event.created<br/>{eventId: 123}
    
    Note over ES,SS: Event Service continues<br/>without waiting
    
    MQ-->>SS: Consume event
    SS->>SDB: INSERT INTO event_sessions<br/>{eventId: 123}
    
    Note over SDB: Data eventually consistent<br/>across services
```

## Handling Data Duplication

### Reference Data Pattern

```mermaid
graph TB
    subgraph "Event Service"
        E1["<b>Event: Web Summit 2025</b><br/>userId: abc-123<br/>userName: null"]
    end
    
    subgraph "User Service"
        U1["<b>User: abc-123</b><br/>name: John Doe<br/>email: john@example.com"]
    end
    
    subgraph "Cache/Denormalization Option"
        E2["<b>Event: Web Summit 2025</b><br/>userId: abc-123<br/>userName: John Doe<br/>cached"]
    end
    
    E1 -.->|Query via gRPC<br/>to get user name| U1
    E1 -.->|Or cache user data<br/>for performance| E2
    
    style E2 fill:#f39c12,stroke:#d68910,stroke-width:3px,color:#000
    style E1 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style U1 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
```

**Strategies:**
1. **Reference by ID**: Store only foreign IDs, query when needed
2. **Data Caching**: Cache frequently accessed data locally
3. **Event Sourcing**: Replicate data via events for read models
4. **CQRS**: Separate read and write models

## Query Patterns Comparison

### Monolithic - Simple Joins

```sql
-- Get event with all sessions and speakers
SELECT 
    e.id, e.name, e.date,
    s.id as session_id, s.name as session_name,
    sp.id as speaker_id, sp.name as speaker_name
FROM events e
LEFT JOIN sessions s ON s.event_id = e.id
LEFT JOIN session_speakers ss ON ss.session_id = s.id
LEFT JOIN speakers sp ON sp.id = ss.speaker_id
WHERE e.id = '123'
AND e.deleted = false
AND s.deleted = false
AND sp.deleted = false;
```

### Microservices - Multiple Service Calls

```typescript
// Event Service
const event = await eventDb.event.findUnique({ 
    where: { id: '123' } 
});

// gRPC call to Session Service
const sessions = await sessionClient.getSessionsByEvent({ 
    eventId: '123' 
});

// For each session, gRPC call to Speaker Service
const sessionsWithSpeakers = await Promise.all(
    sessions.map(async (session) => {
        const speakers = await speakerClient.getSpeakersBySession({
            sessionId: session.id
        });
        return { ...session, speakers };
    })
);

return {
    ...event,
    sessions: sessionsWithSpeakers
};
```

## Data Migration Considerations

### Monolith to Microservices Migration

```mermaid
graph LR
    subgraph "Phase 1: Monolithic DB"
        M["<b>All Tables</b><br/>in Single DB"]
    end
    
    subgraph "Phase 2: Extract Data"
        U["<b>User Tables</b>"]
        E["<b>Event Tables</b>"]
        S["<b>Session Tables</b>"]
        Sp["<b>Speaker Tables</b>"]
    end
    
    subgraph "Phase 3: Microservices DBs"
        U2["<b>User DB</b><br/>Service 1"]
        E2["<b>Event DB</b><br/>Service 2"]
        S2["<b>Session DB</b><br/>Service 3"]
        Sp2["<b>Speaker DB</b><br/>Service 4"]
    end
    
    M --> U & E & S & Sp
    U --> U2
    E --> E2
    S --> S2
    Sp --> Sp2
    
    style M fill:#e74c3c,stroke:#c0392b,stroke-width:4px,color:#fff
    style U fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style E fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style S fill:#e67e22,stroke:#d35400,stroke-width:2px,color:#fff
    style Sp fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
    style U2 fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style E2 fill:#3498db,stroke:#2980b9,stroke-width:3px,color:#fff
    style S2 fill:#e67e22,stroke:#d35400,stroke-width:3px,color:#fff
    style Sp2 fill:#f39c12,stroke:#d68910,stroke-width:3px,color:#000
```

**Migration Steps:**
1. Identify service boundaries
2. Extract tables to separate databases
3. Remove foreign key constraints across services
4. Implement service communication (gRPC/RabbitMQ)
5. Update application code to use service APIs
6. Migrate data incrementally