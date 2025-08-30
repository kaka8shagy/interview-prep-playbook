# System Design TODO List

This file serves as a comprehensive task list for completing the system design section of the interview prep playbook. Each task follows the established content standards from CLAUDE.md.

## 🧹 Cleanup Tasks

### CLEANUP-001: Organize Existing Case Studies
- [ ] Review existing `case-studies/design-twitter.md` for compliance with CLAUDE.md standards
- [ ] Ensure proper file structure follows the template guidelines
- [ ] Update cross-references and relative path links
- [ ] Verify diagrams are in separate `.txt` files

## 🏗️ Fundamentals Complete Implementation

### FUND-001: Scalability Patterns Implementation
**Directory:** `system-design/fundamentals/scalability/`
- [ ] Create `scalability/README.md` (max 400 lines)
  - [ ] Horizontal vs vertical scaling
  - [ ] Load balancing strategies
  - [ ] Database scaling patterns
  - [ ] Microservices scaling
- [ ] Create `scalability/code/` directory with examples:
  - [ ] `load-balancer.js` - Custom load balancer implementation
  - [ ] `rate-limiter.js` - Distributed rate limiting
  - [ ] `auto-scaling.js` - Auto-scaling algorithms
  - [ ] `database-sharding.js` - Sharding implementation
  - [ ] `interview-scaling-calculator.js` - Capacity planning tool
- [ ] Create `scalability/diagrams/` directory:
  - [ ] `scaling-patterns.txt` - Scaling architecture diagrams
  - [ ] `load-balancing-types.txt` - Load balancer configurations

### FUND-002: Reliability & Availability Implementation
**Directory:** `system-design/fundamentals/reliability/`
- [ ] Create `reliability/README.md` (max 400 lines)
  - [ ] Fault tolerance patterns
  - [ ] Circuit breakers and bulkheads
  - [ ] Redundancy strategies
  - [ ] Disaster recovery
- [ ] Create `reliability/code/` directory with examples:
  - [ ] `circuit-breaker.js` - Circuit breaker implementation
  - [ ] `retry-strategies.js` - Retry patterns with backoff
  - [ ] `health-checker.js` - Service health monitoring
  - [ ] `failover-system.js` - Automatic failover
  - [ ] `interview-sla-calculator.js` - SLA/SLO calculations
- [ ] Create `reliability/diagrams/` directory:
  - [ ] `fault-tolerance.txt` - Fault tolerance architectures
  - [ ] `disaster-recovery.txt` - DR topology diagrams

### FUND-003: Caching Strategies Implementation
**Directory:** `system-design/fundamentals/caching/`
- [ ] Create `caching/README.md` (max 400 lines)
  - [ ] Cache patterns and hierarchies
  - [ ] Cache invalidation strategies
  - [ ] Distributed caching
  - [ ] CDN integration
- [ ] Create `caching/code/` directory with examples:
  - [ ] `cache-patterns.js` - Cache-aside, write-through, etc.
  - [ ] `lru-cache.js` - LRU cache implementation
  - [ ] `distributed-cache.js` - Redis clustering
  - [ ] `cdn-simulator.js` - CDN edge caching
  - [ ] `interview-cache-design.js` - Multi-level cache system
- [ ] Create `caching/diagrams/` directory:
  - [ ] `cache-hierarchy.txt` - Multi-level caching
  - [ ] `cdn-architecture.txt` - Global CDN topology

### FUND-004: Load Balancing Implementation
**Directory:** `system-design/fundamentals/load-balancing/`
- [ ] Create `load-balancing/README.md` (max 400 lines)
  - [ ] Load balancing algorithms
  - [ ] Layer 4 vs Layer 7 balancing
  - [ ] Health checking
  - [ ] Session affinity
- [ ] Create `load-balancing/code/` directory with examples:
  - [ ] `load-balancer-algorithms.js` - Round robin, weighted, etc.
  - [ ] `consistent-hashing.js` - Consistent hashing for distribution
  - [ ] `health-checks.js` - Health monitoring system
  - [ ] `session-affinity.js` - Sticky session handling
  - [ ] `interview-load-balancer.js` - Custom load balancer design
- [ ] Create `load-balancing/diagrams/` directory:
  - [ ] `load-balancer-types.txt` - L4 vs L7 architectures
  - [ ] `distribution-algorithms.txt` - Algorithm visualizations

### FUND-005: Database Design Implementation
**Directory:** `system-design/fundamentals/databases/`
- [ ] Create `databases/README.md` (max 400 lines)
  - [ ] SQL vs NoSQL selection criteria
  - [ ] CAP theorem implications
  - [ ] ACID vs BASE models
  - [ ] Partitioning strategies
- [ ] Create `databases/code/` directory with examples:
  - [ ] `database-selector.js` - Database selection framework
  - [ ] `sharding-strategies.js` - Data partitioning
  - [ ] `replication-patterns.js` - Master-slave, multi-master
  - [ ] `consistency-models.js` - Eventual consistency examples
  - [ ] `interview-database-design.js` - Database architecture choices
- [ ] Create `databases/sql/` directory:
  - [ ] `schema-design.sql` - Normalized schema patterns
  - [ ] `partitioning.sql` - Table partitioning examples
  - [ ] `replication.sql` - Replication setup scripts
- [ ] Create `databases/diagrams/` directory:
  - [ ] `database-types.txt` - Database classification
  - [ ] `cap-theorem.txt` - CAP theorem visualization

### FUND-006: Message Queues Implementation
**Directory:** `system-design/fundamentals/messaging/`
- [ ] Create `messaging/README.md` (max 400 lines)
  - [ ] Message queue patterns
  - [ ] Event streaming vs queuing
  - [ ] Delivery guarantees
  - [ ] Queue scaling strategies
- [ ] Create `messaging/code/` directory with examples:
  - [ ] `message-queue.js` - In-memory queue implementation
  - [ ] `event-streaming.js` - Event stream processing
  - [ ] `pub-sub-system.js` - Publisher-subscriber pattern
  - [ ] `dead-letter-queue.js` - Error handling in queues
  - [ ] `interview-messaging-system.js` - Message broker design
- [ ] Create `messaging/diagrams/` directory:
  - [ ] `messaging-patterns.txt` - Queue vs stream architectures
  - [ ] `delivery-guarantees.txt` - At-least-once, exactly-once

### FUND-007: CDN & Edge Computing Implementation
**Directory:** `system-design/fundamentals/cdn/`
- [ ] Create `cdn/README.md` (max 400 lines)
  - [ ] CDN architecture and benefits
  - [ ] Edge caching strategies
  - [ ] Geographic distribution
  - [ ] Edge computing patterns
- [ ] Create `cdn/code/` directory with examples:
  - [ ] `cdn-routing.js` - Geographic routing algorithms
  - [ ] `edge-cache.js` - Edge caching logic
  - [ ] `content-invalidation.js` - Cache invalidation strategies
  - [ ] `edge-computing.js` - Edge function examples
  - [ ] `interview-cdn-design.js` - Global CDN architecture
- [ ] Create `cdn/diagrams/` directory:
  - [ ] `cdn-architecture.txt` - Global CDN topology
  - [ ] `edge-locations.txt` - Edge server distribution

## 📚 Case Studies Complete Implementation

### CASE-001: Social Media Systems Implementation
**Directory:** `system-design/case-studies/social-media/`
- [ ] Create `social-media/design-twitter/` (enhance existing)
  - [ ] Update existing `design-twitter.md` to follow CLAUDE.md standards
  - [ ] Create `design-twitter/code/` directory:
    - [ ] `timeline-algorithm.js` - Feed generation algorithm
    - [ ] `tweet-storage.js` - Tweet data model and storage
    - [ ] `fan-out-service.js` - Timeline fan-out strategies
    - [ ] `trending-algorithm.js` - Trending topics calculation
    - [ ] `interview-twitter-scaling.js` - Scaling challenges
  - [ ] Create `design-twitter/sql/` directory:
    - [ ] `schema.sql` - Complete database schema
    - [ ] `indexes.sql` - Performance optimization indexes
  - [ ] Create `design-twitter/diagrams/` directory:
    - [ ] `system-architecture.txt` - High-level architecture
    - [ ] `data-flow.txt` - Tweet data flow
- [ ] Create `social-media/design-instagram/`
  - [ ] `design-instagram/README.md` (max 400 lines)
  - [ ] `design-instagram/code/` directory with image/video handling
  - [ ] `design-instagram/diagrams/` directory
- [ ] Create `social-media/design-whatsapp/`
  - [ ] `design-whatsapp/README.md` (max 400 lines)
  - [ ] `design-whatsapp/code/` directory with real-time messaging
  - [ ] `design-whatsapp/diagrams/` directory
- [ ] Create `social-media/design-discord/`
  - [ ] `design-discord/README.md` (max 400 lines)
  - [ ] `design-discord/code/` directory with voice/video features
  - [ ] `design-discord/diagrams/` directory

### CASE-002: Video & Streaming Systems Implementation
**Directory:** `system-design/case-studies/streaming/`
- [ ] Create `streaming/design-youtube/`
  - [ ] `design-youtube/README.md` (max 400 lines)
    - [ ] Video upload and processing
    - [ ] CDN and streaming optimization
    - [ ] Recommendation algorithms
    - [ ] Monetization systems
  - [ ] Create `design-youtube/code/` directory:
    - [ ] `video-processing.js` - Video transcoding pipeline
    - [ ] `recommendation-engine.js` - Video recommendation
    - [ ] `streaming-protocol.js` - Adaptive bitrate streaming
    - [ ] `analytics-system.js` - View tracking and analytics
    - [ ] `interview-video-scaling.js` - Video platform scaling
  - [ ] Create `design-youtube/diagrams/` directory:
    - [ ] `video-pipeline.txt` - Upload to delivery pipeline
    - [ ] `cdn-distribution.txt` - Global content distribution
- [ ] Create `streaming/design-netflix/`
  - [ ] `design-netflix/README.md` (max 400 lines)
  - [ ] `design-netflix/code/` directory with content recommendation
  - [ ] `design-netflix/diagrams/` directory
- [ ] Create `streaming/design-twitch/`
  - [ ] `design-twitch/README.md` (max 400 lines)
  - [ ] `design-twitch/code/` directory with live streaming
  - [ ] `design-twitch/diagrams/` directory

### CASE-003: E-commerce & Marketplace Systems Implementation
**Directory:** `system-design/case-studies/ecommerce/`
- [ ] Create `ecommerce/design-amazon/`
  - [ ] `design-amazon/README.md` (max 400 lines)
    - [ ] Product catalog and search
    - [ ] Order processing pipeline
    - [ ] Inventory management
    - [ ] Payment processing
  - [ ] Create `design-amazon/code/` directory:
    - [ ] `product-search.js` - Search and filtering
    - [ ] `order-processing.js` - Order workflow
    - [ ] `inventory-system.js` - Real-time inventory
    - [ ] `recommendation-engine.js` - Product recommendations
    - [ ] `interview-ecommerce-scaling.js` - Peak traffic handling
  - [ ] Create `design-amazon/diagrams/` directory:
    - [ ] `order-workflow.txt` - Order processing flow
    - [ ] `inventory-system.txt` - Inventory architecture
- [ ] Create `ecommerce/design-uber/`
  - [ ] `design-uber/README.md` (max 400 lines)
  - [ ] `design-uber/code/` directory with location services
  - [ ] `design-uber/diagrams/` directory
- [ ] Create `ecommerce/design-stripe/`
  - [ ] `design-stripe/README.md` (max 400 lines)
  - [ ] `design-stripe/code/` directory with payment processing
  - [ ] `design-stripe/diagrams/` directory

### CASE-004: Collaboration Systems Implementation
**Directory:** `system-design/case-studies/collaboration/`
- [ ] Create `collaboration/design-google-docs/`
  - [ ] `design-google-docs/README.md` (max 400 lines)
    - [ ] Real-time collaborative editing
    - [ ] Operational transformation
    - [ ] Conflict resolution
    - [ ] Document versioning
  - [ ] Create `design-google-docs/code/` directory:
    - [ ] `operational-transform.js` - OT algorithm implementation
    - [ ] `conflict-resolution.js` - Merge conflict handling
    - [ ] `document-sync.js` - Real-time synchronization
    - [ ] `version-control.js` - Document versioning
    - [ ] `interview-collaborative-editor.js` - Real-time editor design
  - [ ] Create `design-google-docs/diagrams/` directory:
    - [ ] `collaboration-flow.txt` - Real-time editing flow
    - [ ] `conflict-resolution.txt` - Conflict resolution process
- [ ] Create `collaboration/design-dropbox/`
  - [ ] `design-dropbox/README.md` (max 400 lines)
  - [ ] `design-dropbox/code/` directory with file synchronization
  - [ ] `design-dropbox/diagrams/` directory
- [ ] Create `collaboration/design-zoom/`
  - [ ] `design-zoom/README.md` (max 400 lines)
  - [ ] `design-zoom/code/` directory with video conferencing
  - [ ] `design-zoom/diagrams/` directory

### CASE-005: Search & Analytics Systems Implementation
**Directory:** `system-design/case-studies/search/`
- [ ] Create `search/design-google-search/`
  - [ ] `design-google-search/README.md` (max 400 lines)
    - [ ] Web crawling and indexing
    - [ ] PageRank algorithm
    - [ ] Query processing
    - [ ] Search ranking
  - [ ] Create `design-google-search/code/` directory:
    - [ ] `web-crawler.js` - Distributed web crawler
    - [ ] `pagerank-algorithm.js` - PageRank calculation
    - [ ] `index-builder.js` - Inverted index construction
    - [ ] `query-processor.js` - Search query handling
    - [ ] `interview-search-engine.js` - Search system design
  - [ ] Create `design-google-search/diagrams/` directory:
    - [ ] `crawling-pipeline.txt` - Web crawling architecture
    - [ ] `indexing-system.txt` - Index storage and retrieval
- [ ] Create `search/design-elasticsearch/`
  - [ ] `design-elasticsearch/README.md` (max 400 lines)
  - [ ] `design-elasticsearch/code/` directory
  - [ ] `design-elasticsearch/diagrams/` directory

### CASE-006: Gaming & Entertainment Systems Implementation
**Directory:** `system-design/case-studies/gaming/`
- [ ] Create `gaming/design-fortnite/`
  - [ ] `design-fortnite/README.md` (max 400 lines)
    - [ ] Real-time multiplayer architecture
    - [ ] Game state synchronization
    - [ ] Matchmaking systems
    - [ ] Anti-cheat mechanisms
  - [ ] Create `design-fortnite/code/` directory:
    - [ ] `game-server.js` - Game server implementation
    - [ ] `matchmaking.js` - Player matching algorithms
    - [ ] `state-sync.js` - Game state synchronization
    - [ ] `anti-cheat.js` - Cheat detection systems
    - [ ] `interview-game-scaling.js` - Multiplayer game scaling
- [ ] Create `gaming/design-steam/`
  - [ ] `design-steam/README.md` (max 400 lines)
  - [ ] `design-steam/code/` directory
  - [ ] `design-steam/diagrams/` directory

## 🏛️ Architecture Patterns Implementation

### ARCH-001: Common Architecture Patterns Implementation
**Directory:** `system-design/architecture/patterns/`
- [ ] Create `patterns/README.md` (max 400 lines)
  - [ ] Monolithic vs Microservices
  - [ ] Service-Oriented Architecture
  - [ ] Event-Driven Architecture
  - [ ] Serverless Architecture
- [ ] Create `patterns/code/` directory with examples:
  - [ ] `monolith-to-microservices.js` - Migration strategies
  - [ ] `event-driven-system.js` - Event-driven patterns
  - [ ] `serverless-patterns.js` - Serverless implementations
  - [ ] `api-gateway-pattern.js` - Gateway implementation
  - [ ] `interview-architecture-choice.js` - Architecture selection framework
- [ ] Create `patterns/diagrams/` directory:
  - [ ] `architecture-comparison.txt` - Pattern comparisons
  - [ ] `migration-paths.txt` - Architecture evolution

### ARCH-002: Microservices Architecture Implementation
**Directory:** `system-design/architecture/microservices/`
- [ ] Create `microservices/README.md` (max 400 lines)
  - [ ] Service decomposition strategies
  - [ ] Inter-service communication
  - [ ] Data consistency patterns
  - [ ] Service mesh implementation
- [ ] Create `microservices/code/` directory with examples:
  - [ ] `service-decomposition.js` - Domain-driven design
  - [ ] `saga-pattern.js` - Distributed transaction handling
  - [ ] `circuit-breaker.js` - Fault tolerance
  - [ ] `service-mesh.js` - Service mesh patterns
  - [ ] `interview-microservices-design.js` - Microservices architecture
- [ ] Create `microservices/diagrams/` directory:
  - [ ] `service-architecture.txt` - Service topology
  - [ ] `communication-patterns.txt` - Inter-service communication

### ARCH-003: Data Flow Patterns Implementation
**Directory:** `system-design/architecture/data-flow/`
- [ ] Create `data-flow/README.md` (max 400 lines)
  - [ ] Batch vs Stream processing
  - [ ] ETL vs ELT patterns
  - [ ] Data lake architectures
  - [ ] Real-time analytics
- [ ] Create `data-flow/code/` directory with examples:
  - [ ] `stream-processing.js` - Real-time data processing
  - [ ] `batch-processing.js` - Batch job patterns
  - [ ] `etl-pipeline.js` - Data transformation pipeline
  - [ ] `lambda-architecture.js` - Lambda architecture pattern
  - [ ] `interview-data-pipeline.js` - Data processing system design
- [ ] Create `data-flow/diagrams/` directory:
  - [ ] `data-pipeline.txt` - Data processing flow
  - [ ] `lambda-kappa.txt` - Lambda vs Kappa architecture

## 🚀 Advanced Topics Implementation

### ADV-001: Distributed Systems Theory Implementation
**Directory:** `system-design/advanced/distributed-systems/`
- [ ] Create `distributed-systems/README.md` (max 400 lines)
  - [ ] Consensus algorithms (Raft, PBFT)
  - [ ] Vector clocks and causality
  - [ ] Byzantine fault tolerance
  - [ ] Distributed computing models
- [ ] Create `distributed-systems/code/` directory with examples:
  - [ ] `raft-consensus.js` - Raft algorithm implementation
  - [ ] `vector-clocks.js` - Logical time tracking
  - [ ] `byzantine-agreement.js` - Byzantine fault tolerance
  - [ ] `gossip-protocol.js` - Gossip-based communication
  - [ ] `interview-consensus.js` - Consensus algorithm design
- [ ] Create `distributed-systems/diagrams/` directory:
  - [ ] `consensus-flow.txt` - Consensus algorithm flow
  - [ ] `fault-tolerance.txt` - Byzantine fault scenarios

### ADV-002: Security Architecture Implementation
**Directory:** `system-design/advanced/security/`
- [ ] Create `security/README.md` (max 400 lines)
  - [ ] Zero-trust architecture
  - [ ] Authentication and authorization
  - [ ] Encryption and key management
  - [ ] Security monitoring
- [ ] Create `security/code/` directory with examples:
  - [ ] `zero-trust-gateway.js` - Zero-trust implementation
  - [ ] `oauth-system.js` - OAuth 2.0 / OpenID Connect
  - [ ] `key-management.js` - Cryptographic key handling
  - [ ] `security-monitoring.js` - Security event detection
  - [ ] `interview-security-design.js` - Secure system design
- [ ] Create `security/diagrams/` directory:
  - [ ] `zero-trust-model.txt` - Zero-trust architecture
  - [ ] `auth-flow.txt` - Authentication flow diagrams

### ADV-003: Performance & Optimization Implementation
**Directory:** `system-design/advanced/performance/`
- [ ] Create `performance/README.md` (max 400 lines)
  - [ ] Performance modeling
  - [ ] Capacity planning
  - [ ] Bottleneck analysis
  - [ ] Performance monitoring
- [ ] Create `performance/code/` directory with examples:
  - [ ] `performance-model.js` - Performance modeling tools
  - [ ] `capacity-planner.js` - Capacity planning calculations
  - [ ] `bottleneck-detector.js` - Performance bottleneck analysis
  - [ ] `load-tester.js` - Load testing framework
  - [ ] `interview-performance-analysis.js` - Performance optimization
- [ ] Create `performance/diagrams/` directory:
  - [ ] `performance-metrics.txt` - Key performance indicators
  - [ ] `bottleneck-analysis.txt` - Common bottleneck patterns

## 🎯 Interview Preparation Implementation

### PREP-001: Interview Framework Implementation
**Directory:** `system-design/interview-prep/framework/`
- [ ] Create `framework/README.md` (max 400 lines)
  - [ ] Interview methodology and approach
  - [ ] Requirements gathering techniques
  - [ ] Design iteration strategies
  - [ ] Common interview patterns
- [ ] Create `framework/code/` directory with examples:
  - [ ] `requirement-analyzer.js` - Requirements analysis framework
  - [ ] `capacity-estimator.js` - Back-of-envelope calculations
  - [ ] `design-evaluator.js` - Design quality assessment
  - [ ] `trade-off-analyzer.js` - Trade-off evaluation
  - [ ] `interview-simulator.js` - Practice interview framework
- [ ] Create `framework/templates/` directory:
  - [ ] `design-template.md` - Standard design document template
  - [ ] `requirements-checklist.md` - Requirements gathering checklist

### PREP-002: Practice Problems Implementation
**Directory:** `system-design/interview-prep/practice/`
- [ ] Create `practice/README.md` (max 400 lines)
  - [ ] Progressive difficulty problems
  - [ ] Time-boxed practice sessions
  - [ ] Self-evaluation criteria
  - [ ] Mock interview scenarios
- [ ] Create `practice/problems/` directory:
  - [ ] `beginner/` - Entry-level system design problems
  - [ ] `intermediate/` - Mid-level design challenges
  - [ ] `advanced/` - Senior/staff level problems
  - [ ] `solutions/` - Detailed solution approaches
- [ ] Create `practice/code/` directory:
  - [ ] `problem-generator.js` - Random practice problem generator
  - [ ] `timer-system.js` - Interview timing simulation
  - [ ] `evaluation-rubric.js` - Self-assessment framework

### PREP-003: Common Questions Implementation
**Directory:** `system-design/interview-prep/questions/`
- [ ] Create `questions/README.md` (max 400 lines)
  - [ ] Frequently asked system design questions
  - [ ] Question pattern analysis
  - [ ] Company-specific question trends
  - [ ] Follow-up question preparation
- [ ] Create `questions/categories/` directory:
  - [ ] `social-media.md` - Social platform questions
  - [ ] `messaging.md` - Chat and messaging systems
  - [ ] `streaming.md` - Video/audio streaming questions
  - [ ] `ecommerce.md` - E-commerce platform questions
  - [ ] `infrastructure.md` - Infrastructure design questions

## 📋 Documentation Updates

### DOC-001: Update Main README Files
- [ ] Update `system-design/README.md` to reflect comprehensive new structure
- [ ] Update `system-design/fundamentals/README.md` (create if missing)
- [ ] Update `system-design/case-studies/README.md` (create if missing)
- [ ] Update `system-design/architecture/README.md` (create if missing)
- [ ] Update cross-references between related topics across entire playbook
- [ ] Ensure all relative paths work correctly

### DOC-002: Quality Assurance
- [ ] Verify all markdown files are under 400 lines
- [ ] Ensure all code examples are in separate files with proper extensions
- [ ] Check that all code files have extensive comments (30-50%)
- [ ] Verify all diagrams are in separate `.txt` files with ASCII art
- [ ] Test all cross-references and relative paths
- [ ] Ensure interview-focused problems in each section
- [ ] Validate SQL files for syntax correctness
- [ ] Check diagram readability and clarity

## 🎯 Priority Levels

### High Priority (Complete First)
- CLEANUP-001: Organize existing case studies
- FUND-001, FUND-002, FUND-003: Core scalability, reliability, caching
- CASE-001: Complete Twitter case study enhancement
- PREP-001: Interview framework development

### Medium Priority (Complete Second)
- FUND-004, FUND-005, FUND-006: Load balancing, databases, messaging
- CASE-002, CASE-003: Video streaming and e-commerce systems
- ARCH-001, ARCH-002: Architecture patterns and microservices
- PREP-002: Practice problems and scenarios

### Lower Priority (Complete Last)
- FUND-007: CDN and edge computing
- CASE-004, CASE-005, CASE-006: Collaboration, search, and gaming systems
- ADV-001, ADV-002, ADV-003: Advanced distributed systems topics
- ARCH-003: Data flow patterns
- PREP-003: Question banks and company-specific preparation

## 📝 Notes for Implementation

- Each README.md should be self-contained but cross-reference related topics
- Code examples should demonstrate system components, not just algorithms
- Every code file needs extensive explanatory comments explaining design decisions
- Include "Related Topics" sections linking to other parts of the playbook
- Follow naming conventions: kebab-case for files and directories
- Ensure each topic has 3-5 focused code examples maximum
- Interview problems should include complete solution approaches with trade-offs
- Diagrams should be clear ASCII art in `.txt` files
- Focus on real-world production system considerations
- Include capacity planning and back-of-envelope calculations
- Emphasize trade-off analysis and alternative approaches
- Connect system design concepts to coding interview problems where relevant