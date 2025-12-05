# Microservices Architecture

This diagram illustrates the distributed microservices architecture where each service is independent and isolated.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
    end
    
    subgraph "API Gateway Layer"
        GW[Nginx API Gateway<br/>Port 80<br/>Routing & Load Balancing]
    end
    
    subgraph "Service Layer"
        direction TB
        
        subgraph "User Service"
            US["<b>Express App</b><br/>Port 3001"]
            UDB[("<b>User DB</b><br/>PostgreSQL<br/>Port 5432")]
            US --> UDB
        end
        
        subgraph "Event Service"
            ES["<b>Express App</b><br/>Port 3002"]
            EDB[("<b>Event DB</b><br/>PostgreSQL<br/>Port 5433")]
            ES --> EDB
        end
        
        subgraph "Session Service"
            SS["<b>Express App</b><br/>Port 3003"]
            SDB[("<b>Session DB</b><br/>PostgreSQL<br/>Port 5434")]
            SS --> SDB
        end
        
        subgraph "Speaker Service"
            SpS["<b>Express App</b><br/>Port 3004"]
            SpDB[("<b>Speaker DB</b><br/>PostgreSQL<br/>Port 5435")]
            SpS --> SpDB
        end
    end
    
    subgraph "Communication Layer"
        RMQ[RabbitMQ<br/>Message Broker<br/>Port 5672]
        gRPC[gRPC<br/>Synchronous RPC]
    end
    
    Web --> GW
    Mobile --> GW
    
    GW -->|/api/auth<br/>/api/users| US
    GW -->|/api/events| ES
    GW -->|/api/sessions| SS
    GW -->|/api/speakers| SpS
    
    US -.->|Publish Events| RMQ
    ES -.->|Subscribe| RMQ
    
    ES <-.->|Validate Session| gRPC
    SS <-.->|Get Session Data| gRPC
    
    SS <-.->|Validate Speaker| gRPC
    SpS <-.->|Get Speaker Data| gRPC
    
    style US fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style ES fill:#3498db,stroke:#2980b9,stroke-width:3px,color:#fff
    style SS fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#fff
    style SpS fill:#f39c12,stroke:#d68910,stroke-width:3px,color:#000
    style RMQ fill:#e67e22,stroke:#d35400,stroke-width:3px,color:#fff
    style gRPC fill:#9b59b6,stroke:#8e44ad,stroke-width:3px,color:#fff
    style GW fill:#95a5a6,stroke:#7f8c8d,stroke-width:3px,color:#000
```

## Service Isolation & Independence

```mermaid
graph TB
    subgraph "Complete Service Isolation"
        direction LR
        
        subgraph "User Service Boundary"
            US1[Express Server]
            US2[Business Logic]
            US3[Data Access]
            US4[(User Database<br/>users<br/>user_sessions)]
            
            US1 --> US2 --> US3 --> US4
        end
        
        subgraph "Event Service Boundary"
            ES1[Express Server]
            ES2[Business Logic]
            ES3[Data Access]
            ES4[(Event Database<br/>events<br/>user_events<br/>event_sessions)]
            
            ES1 --> ES2 --> ES3 --> ES4
        end
        
        subgraph "Session Service Boundary"
            SS1[Express Server]
            SS2[Business Logic]
            SS3[Data Access]
            SS4[(Session Database<br/>sessions<br/>session_speakers)]
            
            SS1 --> SS2 --> SS3 --> SS4
        end
        
        subgraph "Speaker Service Boundary"
            SpS1[Express Server]
            SpS2[Business Logic]
            SpS3[Data Access]
            SpS4[(Speaker Database<br/>speakers)]
            
            SpS1 --> SpS2 --> SpS3 --> SpS4
        end
    end
    
    US3 -.->| No Direct Access| ES4
    ES3 -.->| No Direct Access| SS4
    SS3 -.->| No Direct Access| SpS4
```

## Communication Patterns

### Asynchronous Communication (RabbitMQ)

```mermaid
graph LR
    subgraph "Event-Driven Communication"
        P1["<b>User Service</b><br/>Publisher"]
        Q1["<b>user.enrolled</b><br/>Queue"]
        C1["<b>Event Service</b><br/>Consumer"]
        
        P2["<b>Session Service</b><br/>Publisher"]
        Q2["<b>session.created</b><br/>Queue"]
        C2["<b>Event Service</b><br/>Consumer"]
        
        P1 -->|Publish Message| Q1
        Q1 -->|Consume| C1
        
        P2 -->|Publish Message| Q2
        Q2 -->|Consume| C2
    end
    
    style Q1 fill:#e67e22,stroke:#d35400,stroke-width:3px,color:#fff
    style Q2 fill:#e67e22,stroke:#d35400,stroke-width:3px,color:#fff
    style P1 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style C1 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style P2 fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    style C2 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
```

**Use Cases:**
- User enrollment notifications
- Session creation events
- Speaker profile updates
- Audit logging
- Email notifications

### Synchronous Communication (gRPC)

```mermaid
graph LR
    subgraph "Request-Response Communication"
        ES["<b>Event Service</b><br/>gRPC Client"]
        SS["<b>Session Service</b><br/>gRPC Server"]
        
        ES -->|ValidateSession id| SS
        SS -->|Session exists true/false| ES
        
        ES2["<b>Session Service</b><br/>gRPC Client"]
        SpS["<b>Speaker Service</b><br/>gRPC Server"]
        
        ES2 -->|GetSpeaker id| SpS
        SpS -->|Speaker data| ES2
    end
    
    style ES fill:#3498db,stroke:#2980b9,stroke-width:3px,color:#fff
    style SS fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#fff
    style ES2 fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#fff
    style SpS fill:#f39c12,stroke:#d68910,stroke-width:3px,color:#000
```

**Use Cases:**
- Validate entity existence
- Fetch related data for responses
- Real-time consistency checks
- Immediate feedback required

## Horizontal Scaling

```mermaid
graph TB
    GW["<b>API Gateway</b>"]
    
    subgraph "User Service - 3 Instances"
        US1["<b>User Service</b><br/>Instance 1"]
        US2["<b>User Service</b><br/>Instance 2"]
        US3["<b>User Service</b><br/>Instance 3"]
    end
    
    subgraph "Event Service - 5 Instances"
        ES1["<b>Event Service</b><br/>Instance 1"]
        ES2["<b>Event Service</b><br/>Instance 2"]
        ES3["<b>Event Service</b><br/>Instance 3"]
        ES4["<b>Event Service</b><br/>Instance 4"]
        ES5["<b>Event Service</b><br/>Instance 5"]
    end
    
    subgraph "Session Service - 2 Instances"
        SS1["<b>Session Service</b><br/>Instance 1"]
        SS2["<b>Session Service</b><br/>Instance 2"]
    end
    
    subgraph "Speaker Service - 1 Instance"
        SpS1["<b>Speaker Service</b><br/>Instance 1"]
    end
    
    GW --> US1 & US2 & US3
    GW --> ES1 & ES2 & ES3 & ES4 & ES5
    GW --> SS1 & SS2
    GW --> SpS1
    
    Note["<b>Scale each service<br/>independently based<br/>on traffic patterns</b>"]
    
    style Note fill:#34495e,stroke:#2c3e50,stroke-width:2px,color:#fff
    style GW fill:#95a5a6,stroke:#7f8c8d,stroke-width:3px,color:#000
    style US1 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style US2 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style US3 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style ES1 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ES2 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ES3 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ES4 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ES5 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style SS1 fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    style SS2 fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    style SpS1 fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
```

**Benefits:**
- Scale high-traffic services (Events) more than low-traffic services (Speakers)
- Optimal resource utilization
- Cost-effective scaling

## Deployment Architecture

```mermaid
graph TB
    subgraph "Container Orchestration (Docker Compose / Kubernetes)"
        direction TB
        
        subgraph "Network: backend"
            C1[User Service<br/>Container]
            C2[Event Service<br/>Container]
            C3[Session Service<br/>Container]
            C4[Speaker Service<br/>Container]
            C5[RabbitMQ<br/>Container]
        end
        
        subgraph "Network: databases"
            DB1[(User DB<br/>Container)]
            DB2[(Event DB<br/>Container)]
            DB3[(Session DB<br/>Container)]
            DB4[(Speaker DB<br/>Container)]
        end
        
        C1 --> DB1
        C2 --> DB2
        C3 --> DB3
        C4 --> DB4
        
        C1 & C2 & C3 & C4 --> C5
    end
    
    GW[Nginx Gateway<br/>Container] --> C1 & C2 & C3 & C4
```

## Data Isolation

```mermaid
graph TB
    subgraph "Database Per Service Pattern"
        subgraph "User Service Data"
            UD1["<b>users table</b>"]
            UD2["<b>user_sessions table</b>"]
        end
        
        subgraph "Event Service Data"
            ED1["<b>events table</b>"]
            ED2["<b>user_events table</b>"]
            ED3["<b>event_sessions table</b>"]
        end
        
        subgraph "Session Service Data"
            SD1["<b>sessions table</b>"]
            SD2["<b>session_speakers table</b>"]
        end
        
        subgraph "Speaker Service Data"
            SpD1["<b>speakers table</b>"]
        end
    end
    
    Note1["<b>Each service owns<br/>its data exclusively</b>"]
    Note2["<b>No foreign keys<br/>across databases</b>"]
    
    style Note1 fill:#16a085,stroke:#138d75,stroke-width:2px,color:#fff
    style Note2 fill:#d35400,stroke:#ba4a00,stroke-width:2px,color:#fff
    style UD1 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style UD2 fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#000
    style ED1 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ED2 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style ED3 fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    style SD1 fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    style SD2 fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    style SpD1 fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
```

**Data Ownership:**
- User Service: User accounts and authentication
- Event Service: Event information and enrollments
- Session Service: Session details and speaker associations
- Speaker Service: Speaker profiles

## Service Discovery & Health Checks

```mermaid
sequenceDiagram
    participant GW as API Gateway
    participant US as User Service
    participant ES as Event Service
    participant SS as Session Service
    participant SpS as Speaker Service
    
    loop Every 30 seconds
        GW->>US: GET /health
        US-->>GW: 200 OK
        
        GW->>ES: GET /health
        ES-->>GW: 200 OK
        
        GW->>SS: GET /health
        SS-->>GW: 200 OK
        
        GW->>SpS: GET /health
        SpS-->>GW: 200 OK
    end
    
    Note over GW: Routes traffic only<br/>to healthy instances
```

## Fault Isolation

```mermaid
graph TB
    C["<b>Client Request</b>"]
    GW["<b>API Gateway</b>"]
    
    US["<b>User Service</b><br/>✓ Running"]
    ES["<b>Event Service</b><br/>✗ Down"]
    SS["<b>Session Service</b><br/>✓ Running"]
    SpS["<b>Speaker Service</b><br/>✓ Running"]
    
    C --> GW
    GW --> US
    GW -.->|503 Error| ES
    GW --> SS
    GW --> SpS
    
    Note["<b>Event Service failure<br/>doesn't affect<br/>other services</b>"]
    
    style ES fill:#e74c3c,stroke:#c0392b,stroke-width:4px,color:#fff
    style US fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style SS fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style SpS fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#000
    style Note fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#000
    style GW fill:#95a5a6,stroke:#7f8c8d,stroke-width:2px,color:#000
    style C fill:#34495e,stroke:#2c3e50,stroke-width:2px,color:#fff
```

**Resilience:**
- One service failure doesn't crash entire system
- Partial functionality remains available
- Circuit breakers prevent cascading failures

## Advantages

### Benefits
- **Independent Scaling**: Scale services based on load
- **Technology Flexibility**: Use different tech per service
- **Fault Isolation**: Service failures don't cascade
- **Team Autonomy**: Teams own complete services
- **Easier Updates**: Deploy services independently
- **Optimized Resources**: Right-size each service
- **Parallel Development**: Multiple teams work simultaneously

### Challenges
- **Increased Complexity**: More moving parts
- **Network Latency**: Inter-service communication overhead
- **Distributed Transactions**: Data consistency challenges
- **DevOps Overhead**: Requires orchestration and monitoring
- **Debugging Difficulty**: Tracing requests across services
- **Data Duplication**: Some data replicated across services