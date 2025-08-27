# Design Twitter

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

## Capacity Estimation

### Traffic Estimates
- 500M total users, 200M DAU
- Average user follows 200 people
- Average user posts 2 tweets/day
- Average user views timeline 50 times/day

### Calculations
```
Write QPS:
- Tweets: 200M × 2 / 86400 = ~4,600 tweets/second
- Peak: 4,600 × 3 = ~14,000 tweets/second

Read QPS:
- Timeline: 200M × 50 / 86400 = ~115,000 requests/second
- Peak: 115,000 × 3 = ~345,000 requests/second

Storage:
- Tweet size: 280 chars + metadata = ~1KB
- Daily storage: 400M tweets × 1KB = 400GB/day
- 5 years: 400GB × 365 × 5 = ~730TB
```

## High-Level Design

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Clients   │────▶│Load Balancer │────▶│  API Gateway│
└─────────────┘     └──────────────┘     └─────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
            ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
            │ Tweet Service│            │ Timeline     │            │ User Service │
            │              │            │ Service      │            │              │
            └──────────────┘            └──────────────┘            └──────────────┘
                    │                            │                            │
                    ▼                            ▼                            ▼
            ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
            │  Tweet DB    │            │Timeline Cache│            │   User DB    │
            │  (Cassandra) │            │   (Redis)    │            │  (PostgreSQL)│
            └──────────────┘            └──────────────┘            └──────────────┘
                                                 │
                                         ┌───────▼────────┐
                                         │ Message Queue  │
                                         │    (Kafka)     │
                                         └────────────────┘
```

## Detailed Components

### API Design

```
POST /api/v1/tweets
{
  "text": "Hello Twitter!",
  "media_ids": ["media_id_1"],
  "reply_to": "tweet_id"
}

GET /api/v1/timeline?user_id={user_id}&count=20&max_id={tweet_id}

POST /api/v1/users/{user_id}/follow
{
  "target_user_id": "user_to_follow"
}

GET /api/v1/search?q={query}&count=20

POST /api/v1/tweets/{tweet_id}/like
POST /api/v1/tweets/{tweet_id}/retweet
```

### Database Schema

```sql
-- Users table (PostgreSQL)
CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  username VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0
);

-- Follows table (PostgreSQL)
CREATE TABLE follows (
  follower_id BIGINT NOT NULL,
  following_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  INDEX idx_following (following_id)
);

-- Tweets table (Cassandra for scale)
CREATE TABLE tweets (
  tweet_id UUID PRIMARY KEY,
  user_id BIGINT,
  text TEXT,
  media_urls LIST<TEXT>,
  created_at TIMESTAMP,
  likes_count INT,
  retweet_count INT
);

-- User Timeline table (Cassandra)
CREATE TABLE user_timeline (
  user_id BIGINT,
  tweet_id UUID,
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, created_at, tweet_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- Home Timeline Cache (Redis)
// Key: home_timeline:{user_id}
// Value: List of tweet_ids (most recent 800)
// TTL: 24 hours
```

### Algorithm: Timeline Generation

Twitter uses a hybrid approach combining Pull and Push models:

#### Push Model (Write-Heavy)
```python
def post_tweet(user_id, tweet_content):
    # Save tweet
    tweet_id = save_tweet_to_db(user_id, tweet_content)
    
    # Get followers
    followers = get_followers(user_id)
    
    # Fan-out to followers' timelines
    for follower_id in followers:
        if is_active_user(follower_id):
            # Push to Redis cache for active users
            add_to_timeline_cache(follower_id, tweet_id)
        # Always write to persistent storage
        add_to_timeline_db(follower_id, tweet_id)
    
    # Handle celebrities differently
    if followers_count > CELEBRITY_THRESHOLD:
        # Don't fan-out, use pull model instead
        mark_as_celebrity_tweet(tweet_id)
    
    return tweet_id
```

#### Pull Model (Read-Heavy)
```python
def get_home_timeline(user_id, count=20):
    # Check cache first
    cached_timeline = get_from_cache(user_id)
    if cached_timeline:
        return cached_timeline[:count]
    
    # Get list of people user follows
    following = get_following(user_id)
    
    # Separate celebrities from regular users
    celebrities = [u for u in following if is_celebrity(u)]
    regular_users = [u for u in following if not is_celebrity(u)]
    
    # Get pre-computed timeline for regular users
    timeline = get_precomputed_timeline(user_id, regular_users)
    
    # Merge in celebrity tweets on-the-fly
    for celebrity_id in celebrities:
        recent_tweets = get_recent_tweets(celebrity_id, hours=24)
        timeline = merge_tweets(timeline, recent_tweets)
    
    # Sort by timestamp
    timeline.sort(key=lambda x: x.created_at, reverse=True)
    
    # Cache for future requests
    cache_timeline(user_id, timeline)
    
    return timeline[:count]
```

## Scale Calculations

### Storage Requirements
```
Tweets:
- 400M tweets/day × 1KB = 400GB/day
- 3 years retention = 400GB × 1095 = 438TB

User Timelines (pre-computed):
- 500M users × 800 tweets × 8 bytes (tweet_id) = 3.2TB
- With replication (3x) = ~10TB

Media:
- 20% tweets have media × 400M × 100KB avg = 8TB/day
- CDN for distribution
```

### Caching Strategy
```
Redis Cluster:
- Home timelines: 200M active × 800 tweets × 8 bytes = 1.6TB
- User profiles: 500M × 1KB = 500GB
- Trending topics: Negligible

Cache aside pattern with TTL:
- Timeline: 24 hours
- User profiles: 1 hour
- Trending: 15 minutes
```

## Trade-offs

### Pull vs Push for Timeline
**Push (Pre-computed)**
- ✅ Fast reads (simple cache lookup)
- ✅ Predictable read latency
- ❌ Expensive for celebrities (millions of writes)
- ❌ Storage intensive
- ❌ Inactive users waste resources

**Pull (On-demand)**
- ✅ No wasted computation for inactive users
- ✅ Works well for celebrities
- ❌ Slow reads (need to aggregate)
- ❌ High read-time computation

**Hybrid Solution**: Push for regular users, Pull for celebrities

### SQL vs NoSQL
**PostgreSQL for Users**
- Strong consistency for user data
- Complex queries for relationships
- ACID transactions for follows

**Cassandra for Tweets**
- Linear scalability
- Fast writes
- Time-series data optimization
- Eventual consistency acceptable

### Consistency vs Availability
- Choose AP from CAP theorem
- Timeline can be eventually consistent
- User actions (follow/tweet) need to be durable
- Use message queues for reliability

## Deep Dive Topics

### Trending Topics
```python
def calculate_trending():
    # Use sliding window algorithm
    window_size = timedelta(hours=1)
    
    # Count hashtags in recent tweets
    hashtag_counts = count_hashtags_in_window(window_size)
    
    # Apply decay function for older tweets
    weighted_counts = apply_time_decay(hashtag_counts)
    
    # Consider velocity (rate of increase)
    trending = calculate_velocity(weighted_counts)
    
    # Cache results
    cache_trending_topics(trending, ttl=300)
    
    return trending[:10]
```

### Search Implementation
- Use Elasticsearch for full-text search
- Index tweets in near real-time
- Separate search cluster from main database
- Use Kafka to stream tweets to Elasticsearch

### Handling Celebrities
```python
# Celebrities with >10M followers
CELEBRITY_THRESHOLD = 10_000_000

def handle_celebrity_tweet(celebrity_id, tweet):
    # Don't fan-out to all followers
    # Instead, mark tweet for pull-based retrieval
    save_celebrity_tweet(celebrity_id, tweet)
    
    # Only push to most active followers (e.g., recent interactions)
    active_followers = get_active_followers(celebrity_id, limit=10000)
    for follower_id in active_followers:
        add_to_timeline_cache(follower_id, tweet.id)
```

## Follow-up Questions

### How to handle replies and conversations?
- Store parent_tweet_id for threading
- Separate conversation view endpoint
- Cache conversation trees for popular tweets

### How to implement notifications?
- Separate notification service
- Push notifications via Firebase/APNS
- Real-time updates via WebSockets
- Priority queue for celebrity mentions

### How to add media support?
- Separate media service
- Upload to S3/CloudFront
- Generate multiple resolutions
- Lazy loading for timeline

### How to handle spam and abuse?
- Rate limiting per user
- Machine learning for spam detection
- Shadow banning for bad actors
- Community reporting system

### How to implement analytics?
- Stream processing with Kafka + Spark
- Real-time dashboards with time-series DB
- Batch processing for historical analysis
- A/B testing framework

## System Optimizations

### Performance Improvements
1. **Pregenerate timelines** during low traffic
2. **Adaptive caching** based on user activity
3. **Edge caching** with CDN for static content
4. **Connection pooling** for database connections
5. **Async processing** for non-critical operations

### Cost Optimizations
1. **Archive old tweets** to cheaper storage
2. **Compress cached data**
3. **Use spot instances** for batch processing
4. **Implement data retention** policies
5. **Optimize database indexes**

## Related Topics

- [Design WhatsApp](./design-whatsapp.md)
- [Design Instagram](./design-instagram.md)
- [Distributed Caching](../fundamentals/caching.md)
- [Database Sharding](../../backend/databases/sharding.md)
- [Message Queues](../fundamentals/message-queues.md)