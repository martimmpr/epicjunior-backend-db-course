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
        App["<b>Express.js Application</b><br/>Port 3000"]
        
        subgraph "Application Modules"
            Auth["<b>Auth Module</b><br/>Login/Register/JWT"]
            Users["<b>Users Module</b><br/>User Management"]
            Events["<b>Events Module</b><br/>Event CRUD"]
            Sessions["<b>Sessions Module</b><br/>Session Management"]
            Speakers["<b>Speakers Module</b><br/>Speaker Profiles"]
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
        DB[("<b>PostgreSQL</b><br/>Single Database<br/>Port 5432")]
        
        subgraph "Database Tables"
            T1["<b>users</b>"]
            T2["<b>events</b>"]
            T3["<b>sessions</b>"]
            T4["<b>speakers</b>"]
            T5["<b>user_events</b>"]
            T6["<b>session_speakers</b>"]
            T7["<b>user_sessions</b>"]
            T8["<b>event_sessions</b>"]
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
    
    style App fill:#e74c3c,stroke:#c0392b,stroke-width:4px,color:#fff
    style DB fill:#3498db,stroke:#2980b9,stroke-width:4px,color:#fff
    style LB fill:#95a5a6,stroke:#7f8c8d,stroke-width:3px,color:#000
    style Auth fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff
    style Users fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style Events fill:#e67e22,stroke:#d35400,stroke-width:2px,color:#fff
    style Sessions fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
    style Speakers fill:#1abc9c,stroke:#16a085,stroke-width:2px,color:#fff
    style T1 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T2 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T3 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T4 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T5 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T6 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T7 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
    style T8 fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#000
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Single Server/Container"
        direction TB
        Node["<b>Node.js Runtime</b>"]
        Code["<b>Single Codebase</b><br/>All Modules"]
        Node --> Code
    end
    
    subgraph "Database Server"
        PG[("<b>PostgreSQL</b><br/>All Tables")]
    end
    
    Code -->|Single Connection Pool| PG
    
    style Node fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style Code fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#fff
    style PG fill:#3498db,stroke:#2980b9,stroke-width:3px,color:#fff
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
    A["<b>Traffic Increase</b>"] --> B{"<b>Scale Options?</b>"}
    B -->|Only Option| C["<b>Vertical Scaling</b><br/>Bigger Server"]
    B -.->|Not Possible| D["<b>Horizontal Scaling</b><br/>Scale Specific Module"]
    
    C --> E["<b>Higher Costs</b>"]
    C --> F["<b>Hardware Limits</b>"]
    
    E --> G["<b>Eventually Hits Ceiling</b>"]
    F --> G
    
    style D fill:#e74c3c,stroke:#c0392b,stroke-width:4px,color:#fff
    style G fill:#e67e22,stroke:#d35400,stroke-width:3px,color:#fff
    style A fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style B fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
    style C fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style E fill:#95a5a6,stroke:#7f8c8d,stroke-width:2px,color:#000
    style F fill:#95a5a6,stroke:#7f8c8d,stroke-width:2px,color:#000
```

## Module Coupling

```mermaid
graph TB
    subgraph "Tight Coupling Example"
        UM["<b>Users Module</b>"]
        EM["<b>Events Module</b>"]
        SM["<b>Sessions Module</b>"]
        SpM["<b>Speakers Module</b>"]
        
        UM -->|Direct Import| EM
        EM -->|Direct Import| SM
        SM -->|Direct Import| SpM
        SpM -->|Direct Import| UM
        
        UM -.->|Shared Database| DB[("<b>Single DB</b>")]
        EM -.->|Shared Database| DB
        SM -.->|Shared Database| DB
        SpM -.->|Shared Database| DB
    end
    
    style DB fill:#3498db,stroke:#2980b9,stroke-width:4px,color:#fff
    style UM fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style EM fill:#e67e22,stroke:#d35400,stroke-width:2px,color:#fff
    style SM fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
    style SpM fill:#1abc9c,stroke:#16a085,stroke-width:2px,color:#fff
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
        R["<b>All Resources Shared</b>"]
        R --> M1["<b>Auth Module</b>"]
        R --> M2["<b>Users Module</b>"]
        R --> M3["<b>Events Module</b>"]
        R --> M4["<b>Sessions Module</b>"]
        R --> M5["<b>Speakers Module</b>"]
    end
    
    Note1["<b>Cannot allocate more<br/>resources to high-traffic<br/>modules independently</b>"]
    
    style Note1 fill:#e67e22,stroke:#d35400,stroke-width:3px,color:#fff
    style R fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#fff
    style M1 fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff
    style M2 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style M3 fill:#e67e22,stroke:#d35400,stroke-width:2px,color:#fff
    style M4 fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
    style M5 fill:#1abc9c,stroke:#16a085,stroke-width:2px,color:#fff
```

**Problem**: If Events module needs more CPU, entire application must be scaled up.