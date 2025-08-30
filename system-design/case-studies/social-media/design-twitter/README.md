# Design Twitter

## Quick Summary
- Scale: 500M users, 200M DAU with 1000:1 read/write ratio
- Hybrid push/pull timeline generation for optimal performance
- Microservices architecture with Redis caching and message queues
- Separate handling for celebrities vs regular users to manage fan-out costs
- Mix of SQL (users/relationships) and NoSQL (tweets/timelines) databases

## Requirements

### Functional Requirements
- Users can post tweets (280 characters)
- Users can follow/unfollow other users
- Users can view home timeline (tweets from people they follow)
- Users can search tweets
- Users can like and retweet
- Trending topics

### Non-Functional Requirements
- Scale: 500M users, 200M DAU
- Read-heavy: 1000:1 read/write ratio
- Latency: < 200ms for timeline generation
- Availability: 99.9% uptime
- Eventual consistency acceptable for timelines

## High-Level Design

See architecture diagram: `./diagrams/system-architecture.txt`

The system uses a microservices architecture with:
- API Gateway for request routing and rate limiting
- Tweet Service for tweet operations and storage
- Timeline Service for feed generation and caching
- User Service for user management and relationships
- Message queues for asynchronous processing
- Multi-tier caching strategy with Redis

## Detailed Components

### API Design
See API specification: `./api/endpoints.md`

### Database Schema
See complete schema: `./sql/schema.sql`

The design uses:
- PostgreSQL for user data and relationships (strong consistency needed)
- Cassandra for tweets and timelines (optimized for time-series data)
- Redis for caching home timelines and user profiles

### Timeline Generation Algorithm
The system uses a hybrid push/pull approach:
- Push model: Pre-compute timelines for regular users
- Pull model: Generate celebrity timelines on-demand
- Implementation: `./code/timeline-algorithm.js`

## Scale Calculations

### Traffic Estimates
- Write QPS: ~4,600 tweets/second (peak: ~14,000/s)
- Read QPS: ~115,000 requests/second (peak: ~345,000/s)
- Storage: 400GB/day for tweets, ~730TB over 5 years

### Storage Requirements
- Tweet storage: 438TB for 3 years with metadata
- Timeline cache: ~10TB with 3x replication
- Media storage: 8TB/day (served via CDN)

### Caching Strategy
See caching implementation: `./code/caching-strategy.js`
- Redis cluster for home timelines: 1.6TB
- Cache-aside pattern with appropriate TTL values
- Multi-level caching with CDN for media

## Algorithms

### Timeline Generation
- Hybrid push/pull model: `./code/timeline-algorithm.js`
- Celebrity handling: `./code/celebrity-handling.js`
- Fan-out strategies: `./code/fan-out-service.js`

### Trending Topics
- Sliding window algorithm: `./code/trending-algorithm.js`
- Time decay and velocity calculations
- Real-time hashtag counting

### Search Implementation
- Full-text search with Elasticsearch
- Real-time indexing via Kafka streams
- Search implementation: `./code/search-service.js`

## Trade-offs

### Timeline Generation: Push vs Pull
**Push Model (Pre-computed)**
- ✅ Fast reads, predictable latency
- ❌ Expensive for celebrities, storage intensive

**Pull Model (On-demand)**
- ✅ No wasted computation, works for celebrities
- ❌ Slower reads, high computation at read-time

**Solution**: Hybrid approach - push for regular users, pull for celebrities

### Database Choices
**PostgreSQL for Users**: Strong consistency, complex relationship queries
**Cassandra for Tweets**: Linear scalability, optimized for time-series data

### Consistency vs Availability
- Choose AP from CAP theorem
- Timeline eventual consistency acceptable
- User actions require durability via message queues

## Follow-up Questions

### Media and Rich Content
- How to handle image/video uploads?
- CDN strategy for global content delivery
- Multiple resolution generation

### Real-time Features
- How to implement notifications?
- WebSocket connections for live updates
- Push notification delivery

### Content Moderation
- Spam and abuse detection systems
- Machine learning for content filtering
- Community reporting mechanisms

### Analytics and Monitoring
- Real-time metrics and dashboards
- A/B testing framework
- Performance monitoring and alerting

### Advanced Features
- How to handle replies and conversations?
- Direct messaging implementation
- Live video streaming support

## Related Topics
- [Instagram Design](../design-instagram/README.md) _(coming soon)_
- [WhatsApp Design](../design-whatsapp/README.md) _(coming soon)_ 
- [Scalability Patterns](../../../fundamentals/scalability/README.md) _(coming soon)_
- [Caching Strategies](../../../fundamentals/caching/README.md) _(coming soon)_
- [Message Queues](../../../fundamentals/messaging/README.md) _(coming soon)_