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
            US[Express App<br/>Port 3001]
            UDB[(User DB<br/>PostgreSQL<br/>Port 5432)]
            US --> UDB
        end
        
        subgraph "Event Service"
            ES[Express App<br/>Port 3002]
            EDB[(Event DB<br/>PostgreSQL<br/>Port 5433)]
            ES --> EDB
        end
        
        subgraph "Session Service"
            SS[Express App<br/>Port 3003]
            SDB[(Session DB<br/>PostgreSQL<br/>Port 5434)]
            SS --> SDB
        end
        
        subgraph "Speaker Service"
            SpS[Express App<br/>Port 3004]
            SpDB[(Speaker DB<br/>PostgreSQL<br/>Port 5435)]
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
    
    style US fill:#90EE90
    style ES fill:#87CEEB
    style SS fill:#FFB6C1
    style SpS fill:#FFD700
    style RMQ fill:#FF9999
    style gRPC fill:#DDA0DD
    style GW fill:#D3D3D3
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
        P1[User Service<br/>Publisher]
        Q1[user.enrolled<br/>Queue]
        C1[Event Service<br/>Consumer]
        
        P2[Session Service<br/>Publisher]
        Q2[session.created<br/>Queue]
        C2[Event Service<br/>Consumer]
        
        P1 -->|Publish Message| Q1
        Q1 -->|Consume| C1
        
        P2 -->|Publish Message| Q2
        Q2 -->|Consume| C2
    end
    
    style Q1 fill:#FFB6C1
    style Q2 fill:#FFB6C1
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
        ES[Event Service<br/>gRPC Client]
        SS[Session Service<br/>gRPC Server]
        
        ES -->|ValidateSession(id)| SS
        SS -->|Session exists: true/false| ES
        
        ES2[Session Service<br/>gRPC Client]
        SpS[Speaker Service<br/>gRPC Server]
        
        ES2 -->|GetSpeaker(id)| SpS
        SpS -->|Speaker data| ES2
    end
    
    style ES fill:#87CEEB
    style SS fill:#FFB6C1
    style ES2 fill:#FFB6C1
    style SpS fill:#FFD700
```

**Use Cases:**
- Validate entity existence
- Fetch related data for responses
- Real-time consistency checks
- Immediate feedback required

## Horizontal Scaling

```mermaid
graph TB
    GW[API Gateway]
    
    subgraph "User Service - 3 Instances"
        US1[User Service<br/>Instance 1]
        US2[User Service<br/>Instance 2]
        US3[User Service<br/>Instance 3]
    end
    
    subgraph "Event Service - 5 Instances"
        ES1[Event Service<br/>Instance 1]
        ES2[Event Service<br/>Instance 2]
        ES3[Event Service<br/>Instance 3]
        ES4[Event Service<br/>Instance 4]
        ES5[Event Service<br/>Instance 5]
    end
    
    subgraph "Session Service - 2 Instances"
        SS1[Session Service<br/>Instance 1]
        SS2[Session Service<br/>Instance 2]
    end
    
    subgraph "Speaker Service - 1 Instance"
        SpS1[Speaker Service<br/>Instance 1]
    end
    
    GW --> US1 & US2 & US3
    GW --> ES1 & ES2 & ES3 & ES4 & ES5
    GW --> SS1 & SS2
    GW --> SpS1
    
    Note[Scale each service<br/>independently based<br/>on traffic patterns]
    
    style Note fill:#FFFFCC
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
            UD1[users table]
            UD2[user_sessions table]
        end
        
        subgraph "Event Service Data"
            ED1[events table]
            ED2[user_events table]
            ED3[event_sessions table]
        end
        
        subgraph "Session Service Data"
            SD1[sessions table]
            SD2[session_speakers table]
        end
        
        subgraph "Speaker Service Data"
            SpD1[speakers table]
        end
    end
    
    Note1[Each service owns<br/>its data exclusively]
    Note2[No foreign keys<br/>across databases]
    
    style Note1 fill:#FFFFCC
    style Note2 fill:#FFE4CC
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
    C[Client Request]
    GW[API Gateway]
    
    US[User Service<br/> Running]
    ES[Event Service<br/> Down]
    SS[Session Service<br/> Running]
    SpS[Speaker Service<br/> Running]
    
    C --> GW
    GW --> US
    GW -.->|503 Error| ES
    GW --> SS
    GW --> SpS
    
    Note[Event Service failure<br/>doesn't affect<br/>other services]
    
    style ES fill:#ff9999
    style US fill:#90EE90
    style SS fill:#90EE90
    style SpS fill:#90EE90
    style Note fill:#FFFFCC
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