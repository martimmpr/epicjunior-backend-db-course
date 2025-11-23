# Communication Flows

This document illustrates the detailed communication patterns between services in both monolithic and microservices architectures.

## 1. User Registration & Login Flow

### Monolithic Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Monolith App
    participant Auth as Auth Module
    participant User as Users Module
    participant DB as PostgreSQL
    
    Note over C,DB: User Registration
    
    C->>App: POST /auth/register<br/>{name, email, password}
    App->>Auth: registerUser()
    Auth->>Auth: Validate input (Zod)
    Auth->>Auth: Hash password (bcrypt)
    Auth->>User: createUser()
    User->>DB: INSERT INTO users
    DB-->>User: User created
    User-->>Auth: User object
    Auth->>Auth: Generate JWT tokens
    Auth-->>App: {user, accessToken, refreshToken}
    App-->>C: 201 Created
    
    Note over C,DB: User Login
    
    C->>App: POST /auth/login<br/>{email, password}
    App->>Auth: loginUser()
    Auth->>User: findByEmail()
    User->>DB: SELECT * FROM users<br/>WHERE email = ?
    DB-->>User: User data
    User-->>Auth: User object
    Auth->>Auth: Compare passwords<br/>(bcrypt.compare)
    Auth->>Auth: Generate JWT tokens<br/>(15min access, 7d refresh)
    Auth-->>App: {user, accessToken, refreshToken}
    App-->>C: 200 OK
    
    Note over Auth: All operations in<br/>same process,<br/>direct function calls
```

### Microservices Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant US as User Service
    participant UDB as User DB
    participant RMQ as RabbitMQ
    participant ES as Event Service
    
    Note over C,ES: User Registration
    
    C->>GW: POST /api/auth/register<br/>{name, email, password}
    GW->>US: Forward request<br/>Port 3001
    US->>US: Validate input (Zod)
    US->>US: Hash password (bcrypt, rounds=10)
    US->>UDB: INSERT INTO users
    UDB-->>US: User created (UUID)
    US->>US: Generate JWT tokens<br/>Access: 15min<br/>Refresh: 7 days
    US->>RMQ: Publish event<br/>user.registered<br/>{userId, email, name}
    RMQ-->>ES: Consume event<br/>(for analytics/welcome email)
    US-->>GW: 201 Created<br/>{user, tokens}
    GW-->>C: Response
    
    Note over C,ES: User Login
    
    C->>GW: POST /api/auth/login<br/>{email, password}
    GW->>US: Forward request
    US->>UDB: SELECT * FROM users<br/>WHERE email = ?
    UDB-->>US: User data
    US->>US: bcrypt.compare<br/>(password, hash)
    US->>US: Generate new JWT tokens
    US->>RMQ: Publish event<br/>user.logged_in<br/>{userId, timestamp}
    US-->>GW: 200 OK<br/>{user, tokens}
    GW-->>C: Response
    
    Note over US: Service handles auth<br/>independently,<br/>publishes events
```

## 2. User Enrolling in Event

### Monolithic Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Monolith App
    participant Auth as Auth Middleware
    participant Events as Events Module
    participant Users as Users Module
    participant DB as PostgreSQL
    
    C->>App: POST /events/123/enroll<br/>Authorization: Bearer <token>
    App->>Auth: Verify JWT
    Auth->>Auth: jwt.verify(token)
    Auth-->>App: User ID from token
    
    App->>Events: enrollUser(eventId, userId)
    Events->>DB: BEGIN TRANSACTION
    
    Events->>DB: SELECT * FROM events<br/>WHERE id = 123<br/>AND deleted = false
    DB-->>Events: Event data
    
    Events->>Users: getUserById(userId)
    Users->>DB: SELECT * FROM users<br/>WHERE id = userId
    DB-->>Users: User data
    Users-->>Events: User object
    
    Events->>DB: INSERT INTO user_events<br/>(userId, eventId, enrolled)
    DB-->>Events: Enrollment created
    
    Events->>DB: COMMIT TRANSACTION
    
    Events-->>App: Success
    App-->>C: 200 OK
    
    Note over DB: Single transaction,<br/>ACID guarantees,<br/>all data in one database
```

### Microservices Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant US as User Service
    participant UDB as User DB
    participant RMQ as RabbitMQ
    participant ES as Event Service
    participant EDB as Event DB
    
    C->>GW: POST /api/events/123/enroll<br/>Authorization: Bearer <token>
    
    Note over GW: Gateway validates JWT<br/>or forwards to User Service
    
    GW->>ES: POST /events/123/enroll<br/>Headers: userId from JWT
    
    ES->>EDB: SELECT * FROM events<br/>WHERE id = 123<br/>AND deleted = false
    EDB-->>ES: Event exists
    
    Note over ES: Event Service doesn't have<br/>direct access to User DB
    
    ES->>RMQ: Publish message<br/>Queue: user.validate<br/>{userId, eventId}
    
    RMQ-->>US: Consume validation request
    US->>UDB: SELECT * FROM users<br/>WHERE id = userId
    UDB-->>US: User exists
    US->>RMQ: Publish response<br/>Queue: user.validated<br/>{userId, valid: true}
    
    RMQ-->>ES: User validation result
    
    ES->>EDB: INSERT INTO user_events<br/>(userId, eventId, enrolled)
    EDB-->>ES: Enrollment created
    
    ES->>RMQ: Publish event<br/>Queue: event.user_enrolled<br/>{userId, eventId, timestamp}
    
    RMQ-->>US: Consume enrollment event
    US->>UDB: INSERT INTO user_sessions<br/>tracking record
    
    ES-->>GW: 200 OK
    GW-->>C: Response
    
    Note over US,ES: Eventual consistency,<br/>asynchronous communication,<br/>distributed transaction
```

## 3. Adding Speaker to Session (gRPC Sync Call)

### Monolithic Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Monolith App
    participant Sessions as Sessions Module
    participant Speakers as Speakers Module
    participant DB as PostgreSQL
    
    C->>App: POST /sessions/456/speakers/789
    
    App->>Sessions: addSpeakerToSession(sessionId, speakerId)
    
    Sessions->>DB: SELECT * FROM sessions<br/>WHERE id = 456<br/>AND deleted = false
    DB-->>Sessions: Session exists
    
    Sessions->>Speakers: getSpeakerById(789)
    Speakers->>DB: SELECT * FROM speakers<br/>WHERE id = 789<br/>AND deleted = false
    DB-->>Speakers: Speaker data
    Speakers-->>Sessions: Speaker object
    
    Sessions->>DB: INSERT INTO session_speakers<br/>(sessionId, speakerId)
    DB-->>Sessions: Association created
    
    Sessions-->>App: Success
    App-->>C: 200 OK
    
    Note over Speakers,Sessions: Direct function call<br/>in same process
```

### Microservices Architecture (gRPC)

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant SS as Session Service
    participant SDB as Session DB
    participant gRPC as gRPC Channel
    participant SpS as Speaker Service
    participant SpDB as Speaker DB
    
    C->>GW: POST /api/sessions/456/speakers/789
    GW->>SS: Forward request
    
    SS->>SDB: SELECT * FROM sessions<br/>WHERE id = 456<br/>AND deleted = false
    SDB-->>SS: Session exists
    
    Note over SS,SpS: Synchronous gRPC call<br/>for immediate validation
    
    SS->>gRPC: ValidateSpeaker(speakerId: "789")
    gRPC->>SpS: RPC Request
    SpS->>SpDB: SELECT * FROM speakers<br/>WHERE id = 789<br/>AND deleted = false
    SpDB-->>SpS: Speaker data
    SpS->>gRPC: Response{exists: true, speaker: {...}}
    gRPC-->>SS: Speaker validated
    
    SS->>SDB: INSERT INTO session_speakers<br/>(sessionId, speakerId)
    SDB-->>SS: Association created
    
    SS->>gRPC: GetSpeaker(speakerId: "789")
    gRPC->>SpS: RPC Request
    SpS->>SpDB: SELECT * FROM speakers
    SpDB-->>SpS: Full speaker data
    SpS->>gRPC: Response{speaker: {...}}
    gRPC-->>SS: Speaker details
    
    SS-->>GW: 200 OK<br/>{session with speaker details}
    GW-->>C: Response
    
    Note over SS,SpS: gRPC: Fast, type-safe,<br/>synchronous communication
```

## 4. User Attending Session

### Monolithic Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Monolith App
    participant Users as Users Module
    participant Sessions as Sessions Module
    participant Events as Events Module
    participant DB as PostgreSQL
    
    C->>App: POST /users/111/sessions/456<br/>Mark attendance
    
    App->>Users: markSessionAttendance(userId, sessionId)
    
    Users->>DB: BEGIN TRANSACTION
    
    Users->>DB: SELECT * FROM users<br/>WHERE id = 111
    DB-->>Users: User exists
    
    Users->>Sessions: getSessionById(456)
    Sessions->>DB: SELECT * FROM sessions<br/>WHERE id = 456
    DB-->>Sessions: Session data (includes eventId)
    Sessions-->>Users: Session object
    
    Users->>Events: validateUserEnrolled(userId, eventId)
    Events->>DB: SELECT * FROM user_events<br/>WHERE userId = 111<br/>AND eventId = ?<br/>AND enrolled = true
    DB-->>Events: User enrolled
    Events-->>Users: Valid
    
    Users->>DB: INSERT INTO user_sessions<br/>(userId, sessionId, eventId, attended)
    DB-->>Users: Attendance recorded
    
    Users->>DB: COMMIT TRANSACTION
    
    Users-->>App: Success
    App-->>C: 200 OK
    
    Note over DB: All validations and updates<br/>in single transaction
```

### Microservices Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant US as User Service
    participant UDB as User DB
    participant gRPC as gRPC
    participant SS as Session Service
    participant SDB as Session DB
    participant RMQ as RabbitMQ
    participant ES as Event Service
    participant EDB as Event DB
    
    C->>GW: POST /api/users/111/sessions/456
    GW->>US: Forward request
    
    US->>UDB: SELECT * FROM users<br/>WHERE id = 111
    UDB-->>US: User exists
    
    Note over US,SS: gRPC call to validate session
    
    US->>gRPC: GetSession(sessionId: "456")
    gRPC->>SS: RPC Request
    SS->>SDB: SELECT * FROM sessions<br/>WHERE id = 456
    SDB-->>SS: Session data (includes eventId)
    SS->>gRPC: Response{session: {...}}
    gRPC-->>US: Session details with eventId
    
    Note over US,ES: Async message to validate enrollment
    
    US->>RMQ: Publish message<br/>Queue: validate.enrollment<br/>{userId: 111, eventId: 222}
    
    RMQ-->>ES: Consume validation request
    ES->>EDB: SELECT * FROM user_events<br/>WHERE userId = 111<br/>AND eventId = 222
    EDB-->>ES: Enrollment exists
    ES->>RMQ: Publish response<br/>Queue: enrollment.validated<br/>{valid: true}
    
    RMQ-->>US: Validation result
    
    US->>UDB: INSERT INTO user_sessions<br/>(userId, sessionId, eventId, attended)
    UDB-->>US: Attendance recorded
    
    US->>RMQ: Publish event<br/>Queue: session.attended<br/>{userId, sessionId, eventId, timestamp}
    
    RMQ-->>ES: Update analytics
    RMQ-->>SS: Update session stats
    
    US-->>GW: 200 OK
    GW-->>C: Response
    
    Note over US,ES: Distributed across services,<br/>eventual consistency,<br/>event-driven updates
```

## Communication Patterns Comparison

### Synchronous vs Asynchronous

```mermaid
graph TB
    subgraph "Synchronous (gRPC)"
        S1[Client Service] -->|Request| S2[Server Service]
        S2 -->|Response| S1
        S1 -->|Waits for response| S1
        
        Note1[Use when:<br/>- Need immediate response<br/>- Validation required<br/>- Data consistency critical]
    end
    
    subgraph "Asynchronous (RabbitMQ)"
        A1[Publisher Service] -->|Publish| Q[Message Queue]
        Q -->|Consume| A2[Consumer Service]
        A1 -->|Continues immediately| A1
        
        Note2[Use when:<br/>- Fire and forget<br/>- Event notifications<br/>- Decoupled services]
    end
    
    style Note1 fill:#E0FFE0
    style Note2 fill:#FFE0E0
```

## Error Handling Patterns

### Monolithic - Simple Error Propagation

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Monolith
    participant DB as Database
    
    C->>App: Request
    App->>DB: Query
    DB-->>App: Error (Connection Failed)
    App-->>C: 500 Internal Server Error
    
    Note over App: Single error handler<br/>catches all errors
```

### Microservices - Distributed Error Handling

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as Gateway
    participant S1 as Service A
    participant S2 as Service B
    participant MQ as RabbitMQ
    
    C->>GW: Request
    GW->>S1: Forward
    S1->>S2: gRPC Call
    S2-->>S1: Error (503 Service Unavailable)
    
    Note over S1: Circuit breaker opens<br/>after N failures
    
    S1->>S1: Fallback logic
    S1-->>GW: Partial response
    GW-->>C: 206 Partial Content
    
    S1->>MQ: Publish error event<br/>for monitoring
    
    Note over S1,S2: Resilient failure handling,<br/>graceful degradation
```

## Performance Comparison

### Monolithic - Low Latency

```mermaid
graph LR
    A[Request] -->|5ms| B[Auth Check]
    B -->|10ms| C[Business Logic]
    C -->|20ms| D[Database Query]
    D -->|5ms| E[Response]
    
    Total[Total: ~40ms]
    
    style Total fill:#90EE90
```

### Microservices - Higher Latency

```mermaid
graph LR
    A[Request] -->|5ms| B[Gateway]
    B -->|10ms<br/>network| C[Service A]
    C -->|20ms| D[Database A]
    C -->|15ms<br/>gRPC| E[Service B]
    E -->|20ms| F[Database B]
    E -->|10ms<br/>network| C
    C -->|10ms<br/>network| B
    B -->|5ms| G[Response]
    
    Total[Total: ~95ms]
    
    style Total fill:#FFB6C1
```

**Trade-off**: Microservices add network latency but provide better scalability and resilience.