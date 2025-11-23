# Monolithic Architecture

This diagram illustrates the traditional monolithic architecture where all components run in a single application.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
    end
    
    subgraph "Infrastructure"
        LB[Load Balancer<br/>nginx/HAProxy]
    end
    
    subgraph "Monolithic Application"
        direction TB
        App[Express.js Application<br/>Port 3000]
        
        subgraph "Application Modules"
            Auth[Auth Module<br/>Login/Register/JWT]
            Users[Users Module<br/>User Management]
            Events[Events Module<br/>Event CRUD]
            Sessions[Sessions Module<br/>Session Management]
            Speakers[Speakers Module<br/>Speaker Profiles]
        end
        
        App --> Auth
        App --> Users
        App --> Events
        App --> Sessions
        App --> Speakers
        
        Auth -.->|Direct Function Calls| Users
        Events -.->|Tightly Coupled| Sessions
        Sessions -.->|Shared Memory| Speakers
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Single Database<br/>Port 5432)]
        
        subgraph "Database Tables"
            T1[users]
            T2[events]
            T3[sessions]
            T4[speakers]
            T5[user_events]
            T6[session_speakers]
            T7[user_sessions]
            T8[event_sessions]
        end
    end
    
    Web --> LB
    Mobile --> LB
    LB --> App
    
    Auth --> DB
    Users --> DB
    Events --> DB
    Sessions --> DB
    Speakers --> DB
    
    DB --> T1
    DB --> T2
    DB --> T3
    DB --> T4
    DB --> T5
    DB --> T6
    DB --> T7
    DB --> T8
    
    style App fill:#ff9999
    style DB fill:#99ccff
    style LB fill:#cccccc
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Single Server/Container"
        direction TB
        Node[Node.js Runtime]
        Code[Single Codebase<br/>All Modules]
        Node --> Code
    end
    
    subgraph "Database Server"
        PG[(PostgreSQL<br/>All Tables)]
    end
    
    Code -->|Single Connection Pool| PG
    
    style Node fill:#90EE90
    style Code fill:#ff9999
    style PG fill:#99ccff
```

## Characteristics

### Advantages
- **Simple Deployment**: Single Docker container or process
- **Easy Development**: All code in one repository
- **Direct Function Calls**: No network latency between modules
- **ACID Transactions**: Database transactions across all tables
- **Easier Debugging**: Single log file, single process to debug
- **Lower Infrastructure Costs**: One server, one database

### Limitations
- **Vertical Scaling Only**: Must upgrade entire server
- **Single Point of Failure**: If app crashes, everything is down
- **Technology Lock-in**: All modules must use same tech stack
- **Deployment Risk**: Small change requires full redeployment
- **Team Conflicts**: Multiple developers working on same codebase
- **Resource Inefficiency**: Cannot scale individual features
- **Long Startup Time**: Must load all modules on startup

## Scalability Bottlenecks

```mermaid
graph TD
    A[Traffic Increase] --> B{Scale Options?}
    B -->|Only Option| C[Vertical Scaling<br/>Bigger Server]
    B -.->|Not Possible| D[Horizontal Scaling<br/>Scale Specific Module]
    
    C --> E[Higher Costs]
    C --> F[Hardware Limits]
    
    E --> G[Eventually Hits Ceiling]
    F --> G
    
    style D fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style G fill:#ff9999
```

## Module Coupling

```mermaid
graph TB
    subgraph "Tight Coupling Example"
        UM[Users Module]
        EM[Events Module]
        SM[Sessions Module]
        SpM[Speakers Module]
        
        UM -->|Direct Import| EM
        EM -->|Direct Import| SM
        SM -->|Direct Import| SpM
        SpM -->|Direct Import| UM
        
        UM -.->|Shared Database| DB[(Single DB)]
        EM -.->|Shared Database| DB
        SM -.->|Shared Database| DB
        SpM -.->|Shared Database| DB
    end
    
    style DB fill:#99ccff
```

**Impact of Coupling:**
- Changes in one module can break others
- Difficult to replace or upgrade individual modules
- Testing requires entire application
- Cannot use different technologies per module

## Typical Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant LB as Load Balancer
    participant App as Monolith App
    participant DB as PostgreSQL
    
    C->>LB: POST /events/123/enroll
    LB->>App: Route to Express
    
    App->>App: Auth Middleware<br/>(JWT Validation)
    App->>App: Users Module<br/>(Get User)
    App->>DB: SELECT * FROM users
    DB-->>App: User Data
    
    App->>App: Events Module<br/>(Get Event)
    App->>DB: SELECT * FROM events
    DB-->>App: Event Data
    
    App->>App: Events Module<br/>(Create Enrollment)
    App->>DB: INSERT INTO user_events
    DB-->>App: Success
    
    App-->>LB: 200 OK
    LB-->>C: Response
    
    Note over App,DB: All operations in<br/>single process<br/>Single database transaction
```

## Resource Usage Pattern

```mermaid
graph TB
    subgraph "CPU & Memory"
        R[All Resources Shared]
        R --> M1[Auth Module]
        R --> M2[Users Module]
        R --> M3[Events Module]
        R --> M4[Sessions Module]
        R --> M5[Speakers Module]
    end
    
    Note1[Cannot allocate more<br/>resources to high-traffic<br/>modules independently]
    
    style Note1 fill:#ffffcc
```

**Problem**: If Events module needs more CPU, entire application must be scaled up.