# System Design Interview Preparation

Comprehensive system design topics for staff/architect level interviews.

## Core Topics

### 🏗️ Fundamentals
Essential concepts for designing large-scale systems.

- [Scalability Patterns](./fundamentals/scalability.md)
- [Reliability & Availability](./fundamentals/reliability.md)
- [Caching Strategies](./fundamentals/caching.md)
- [Load Balancing](./fundamentals/load-balancing.md)
- [Database Design](./fundamentals/database-design.md)
- [Message Queues](./fundamentals/message-queues.md)
- [CDN & Edge Computing](./fundamentals/cdn.md)

### 📚 Case Studies
Real-world system design problems with detailed solutions.

#### Social Media & Communication
- [Design Twitter](./case-studies/design-twitter.md)
- [Design Instagram](./case-studies/design-instagram.md)
- [Design WhatsApp](./case-studies/design-whatsapp.md)
- [Design Discord](./case-studies/design-discord.md)

#### Video & Streaming
- [Design YouTube](./case-studies/design-youtube.md)
- [Design Netflix](./case-studies/design-netflix.md)
- [Design Twitch](./case-studies/design-twitch.md)

#### E-commerce & Payments
- [Design Amazon](./case-studies/design-amazon.md)
- [Design Uber](./case-studies/design-uber.md)
- [Design Stripe](./case-studies/design-stripe.md)

#### Collaboration & Productivity
- [Design Google Docs](./case-studies/design-google-docs.md)
- [Design Dropbox](./case-studies/design-dropbox.md)
- [Design Zoom](./case-studies/design-zoom.md)

### 📊 Architecture Diagrams
Visual representations and patterns.

- [Common Architecture Patterns](./diagrams/architecture-patterns.md)
- [Microservices Architectures](./diagrams/microservices.md)
- [Data Flow Diagrams](./diagrams/data-flow.md)
- [Deployment Topologies](./diagrams/deployment.md)

## Interview Framework

### 1. Requirements Gathering (5-10 mins)
- **Functional Requirements**
  - Core features
  - User interactions
  - Data operations

- **Non-Functional Requirements**
  - Scale (users, requests, data)
  - Performance (latency, throughput)
  - Availability & Reliability
  - Consistency requirements

### 2. Capacity Estimation (5 mins)
- Traffic estimates
- Storage requirements
- Bandwidth calculations
- Memory/Cache needs

### 3. High-Level Design (10-15 mins)
- System architecture
- Major components
- Data flow
- API design

### 4. Detailed Design (15-20 mins)
- Database schema
- Algorithm design
- Component deep dives
- Optimization strategies

### 5. Scale & Optimize (10-15 mins)
- Bottleneck identification
- Caching strategies
- Database optimization
- Geographic distribution

### 6. Trade-offs & Alternatives (5-10 mins)
- Design decisions
- Alternative approaches
- Cost considerations
- Future extensions

## Key Concepts

### Scalability
- **Horizontal Scaling**: Adding more machines
- **Vertical Scaling**: Adding more power to existing machines
- **Database Scaling**: Replication, Sharding, Denormalization
- **Caching**: CDN, Application-level, Database-level

### Reliability
- **Redundancy**: No single point of failure
- **Replication**: Data and service replication
- **Fault Tolerance**: Graceful degradation
- **Monitoring**: Metrics, logs, alerts

### Performance
- **Latency**: Response time optimization
- **Throughput**: Requests per second
- **Caching**: Multi-level caching strategies
- **Load Balancing**: Distribution algorithms

### Data Management
- **CAP Theorem**: Consistency, Availability, Partition Tolerance
- **ACID vs BASE**: Transaction guarantees
- **SQL vs NoSQL**: Use case selection
- **Data Partitioning**: Sharding strategies

## Common Patterns

### Architecture Patterns
- Microservices
- Service-Oriented Architecture (SOA)
- Serverless
- Event-Driven Architecture

### Communication Patterns
- REST APIs
- GraphQL
- WebSockets
- Server-Sent Events (SSE)
- Message Queues

### Data Patterns
- Master-Slave Replication
- Sharding/Partitioning
- Federation
- Denormalization
- Event Sourcing

### Caching Patterns
- Cache-aside
- Write-through
- Write-behind
- Refresh-ahead

## Study Plan

### Week 1: Fundamentals
- Master scalability concepts
- Understand database design
- Learn caching strategies

### Week 2: Communication Systems
- Design chat applications
- Study real-time features
- Practice WebSocket scaling

### Week 3: Media Systems
- Video streaming architecture
- CDN design
- Storage optimization

### Week 4: Distributed Systems
- Consistency models
- Consensus algorithms
- Failure handling

## Interview Tips

1. **Start Simple**: Begin with a basic design and iterate
2. **Think Aloud**: Communicate your thought process
3. **Ask Questions**: Clarify requirements and constraints
4. **Consider Trade-offs**: Discuss pros and cons of decisions
5. **Be Realistic**: Consider practical limitations
6. **Draw Diagrams**: Visualize your design clearly

## Evaluation Criteria

Interviewers typically evaluate:
- Problem-solving approach
- System design knowledge
- Trade-off analysis
- Scalability considerations
- Code/component organization
- Communication skills

## Resources

Each case study includes:
- Problem statement
- Requirements analysis
- Capacity planning
- System architecture
- Database design
- API specifications
- Scalability discussion
- Trade-offs and alternatives

## Quick Reference

### Back-of-the-envelope Calculations
- 1 million users = ~100 requests/second
- 1 KB = 1000 bytes (roughly)
- 1 MB = 1 million bytes
- 1 GB = 1 billion bytes
- Daily active users = Monthly active users / 3
- Peak QPS = Average QPS × 2-3

### Common Bottlenecks
- Database (most common)
- Application server CPU
- Network bandwidth
- Cache capacity
- Disk I/O

### Scale Numbers
- Single server: thousands of users
- Single database: 10K-100K queries/second
- Memory cache: 1M+ queries/second
- CDN: Global distribution