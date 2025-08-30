-- Twitter Database Schema
-- This schema demonstrates the hybrid approach using both SQL and NoSQL databases
-- PostgreSQL for user data requiring strong consistency
-- Cassandra for tweets and timelines requiring high write throughput

-- ===============================================
-- PostgreSQL Schema (User Service Database)
-- ===============================================

-- Users table - stores core user information
-- Strong consistency required for user authentication and profile data
CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  username VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50),
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(200),
  profile_image_url VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  tweets_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Follows/Following relationships
-- Composite primary key ensures no duplicate relationships
-- Indexes on both directions for efficient follower/following queries
CREATE TABLE follows (
  follower_id BIGINT NOT NULL,
  following_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(user_id),
  FOREIGN KEY (following_id) REFERENCES users(user_id)
);

-- Index for getting followers of a user (who follows X?)
CREATE INDEX idx_follows_following_id ON follows(following_id);
-- Index for getting who a user follows (X follows who?)
CREATE INDEX idx_follows_follower_id ON follows(follower_id);

-- User sessions for authentication
CREATE TABLE user_sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- ===============================================
-- Cassandra Schema (Tweet Service Database)
-- ===============================================

-- Tweets table - optimized for high write throughput and time-series access
-- Partition by tweet_id for even distribution
-- Clustering by created_at for time-based queries
CREATE TABLE tweets (
  tweet_id UUID PRIMARY KEY,
  user_id BIGINT,
  text TEXT,
  media_urls LIST<TEXT>,
  hashtags SET<TEXT>,
  mentions LIST<BIGINT>,
  reply_to_tweet_id UUID,
  reply_to_user_id BIGINT,
  created_at TIMESTAMP,
  likes_count COUNTER,
  retweet_count COUNTER,
  reply_count COUNTER,
  is_retweet BOOLEAN,
  original_tweet_id UUID,
  location TEXT,
  lang VARCHAR(10)
);

-- User timeline - stores tweets from a specific user in chronological order
-- Partition by user_id, cluster by timestamp for efficient range queries
-- Used for user profile pages showing their tweets
CREATE TABLE user_timeline (
  user_id BIGINT,
  tweet_id UUID,
  created_at TIMESTAMP,
  is_retweet BOOLEAN,
  PRIMARY KEY (user_id, created_at, tweet_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- Home timeline cache - pre-computed timelines for active users
-- Stores the most recent 800 tweets for each user's home feed
-- Partitioned by user_id for even distribution and fast lookups
CREATE TABLE home_timeline_cache (
  user_id BIGINT,
  tweet_id UUID,
  created_at TIMESTAMP,
  tweet_score DOUBLE, -- For ranking/algorithmic timeline
  PRIMARY KEY (user_id, created_at, tweet_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- Tweet interactions - likes, retweets, etc.
-- Separate table to avoid hot partitions on popular tweets
CREATE TABLE tweet_interactions (
  tweet_id UUID,
  user_id BIGINT,
  interaction_type VARCHAR(20), -- 'like', 'retweet', 'reply'
  created_at TIMESTAMP,
  PRIMARY KEY (tweet_id, user_id, interaction_type)
);

-- Reverse index for user interactions (what has this user liked/retweeted?)
CREATE TABLE user_interactions (
  user_id BIGINT,
  tweet_id UUID,
  interaction_type VARCHAR(20),
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, interaction_type, created_at, tweet_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- Trending hashtags - time-bucketed for efficient trending calculations
-- Partition by time bucket (hour) for parallel processing
CREATE TABLE hashtag_counts (
  hashtag TEXT,
  time_bucket TIMESTAMP, -- Rounded to nearest hour
  count COUNTER,
  PRIMARY KEY (time_bucket, hashtag)
);

-- Celebrity users - users with high follower count requiring special handling
-- Separate table to quickly identify celebrities for different fan-out strategy
CREATE TABLE celebrity_users (
  user_id BIGINT PRIMARY KEY,
  followers_count BIGINT,
  celebrity_tier INT, -- 1=mega (>10M), 2=major (>1M), 3=minor (>100K)
  added_at TIMESTAMP,
  last_updated TIMESTAMP
);

-- ===============================================
-- Additional Indexes and Materialized Views
-- ===============================================

-- PostgreSQL indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_followers_count ON users(followers_count DESC);

-- Materialized view for user statistics (refreshed periodically)
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  u.user_id,
  u.username,
  u.followers_count,
  u.following_count,
  u.tweets_count,
  u.created_at,
  (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.user_id) AS actual_followers,
  (SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.user_id) AS actual_following
FROM users u
WHERE u.is_active = TRUE;

CREATE UNIQUE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- ===============================================
-- Sample Queries for Performance Testing
-- ===============================================

-- Get user's home timeline (most common query)
-- SELECT tweet_id, created_at 
-- FROM home_timeline_cache 
-- WHERE user_id = ? 
-- ORDER BY created_at DESC 
-- LIMIT 20;

-- Get user's own tweets
-- SELECT tweet_id, text, created_at 
-- FROM user_timeline 
-- WHERE user_id = ? 
-- ORDER BY created_at DESC 
-- LIMIT 20;

-- Get user's followers
-- SELECT u.user_id, u.username, u.display_name
-- FROM follows f
-- JOIN users u ON f.follower_id = u.user_id
-- WHERE f.following_id = ?
-- ORDER BY f.created_at DESC;

-- Check if user A follows user B
-- SELECT 1 FROM follows 
-- WHERE follower_id = ? AND following_id = ? 
-- LIMIT 1;