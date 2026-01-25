# Database Schema Documentation

## Overview

This document describes the complete database schema for the research-focused chat platform. The database uses PostgreSQL.

---

## Tables

### 1. users

Stores user account information and state.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  assigned_agent_id INTEGER NOT NULL CHECK (assigned_agent_id BETWEEN 1 AND 9),
  current_topic_index INTEGER NOT NULL DEFAULT 0 CHECK (current_topic_index BETWEEN 0 AND 19),
  has_completed_literacy_survey BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_assigned_agent ON users(assigned_agent_id);
```

**Columns:**
- `id` - Unique user identifier (UUID)
- `email` - User email address (unique)
- `password_hash` - Bcrypt hashed password
- `assigned_agent_id` - Agent assigned to user (1-9, never changes)
- `current_topic_index` - Current topic the user is on (0-19)
- `has_completed_literacy_survey` - Whether AI literacy survey is completed
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

---

### 2. agents

Stores the 9 predefined agent configurations.

```sql
CREATE TABLE agents (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 9),
  name VARCHAR(255) NOT NULL,
  emotional_intelligence_level INTEGER NOT NULL CHECK (emotional_intelligence_level BETWEEN 1 AND 10),
  cognitive_intelligence_level INTEGER NOT NULL CHECK (cognitive_intelligence_level BETWEEN 1 AND 10),
  system_prompt_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `id` - Agent identifier (1-9)
- `name` - Agent display name
- `emotional_intelligence_level` - EQ level (1-10)
- `cognitive_intelligence_level` - IQ level (1-10)
- `system_prompt_template` - Base system prompt for this agent
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

---

### 3. topics

Stores the 20 conversation topics.

```sql
CREATE TABLE topics (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 20),
  title VARCHAR(255) NOT NULL,
  stimulus_text TEXT NOT NULL,
  topic_specific_policy TEXT NOT NULL,
  order_index INTEGER NOT NULL UNIQUE CHECK (order_index BETWEEN 1 AND 20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_order ON topics(order_index);
```

**Columns:**
- `id` - Topic identifier (1-20)
- `title` - Topic display title
- `stimulus_text` - Initial context/stimulus for the topic
- `topic_specific_policy` - Policy specific to this topic
- `order_index` - Order in which topics are presented (1-20)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

---

### 4. messages

Stores all chat messages between users and agents.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_user_topic ON messages(user_id, topic_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_user ON messages(user_id);
```

**Columns:**
- `id` - Message identifier (UUID)
- `user_id` - Reference to user who sent/received message
- `topic_id` - Reference to topic this message belongs to
- `role` - Either 'user' or 'agent'
- `content` - Message text content
- `timestamp` - When message was sent
- `created_at` - Record creation timestamp

---

### 5. user_topic_interactions

Tracks interaction counts and lock status for each user-topic combination.

```sql
CREATE TABLE user_topic_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  interaction_count INTEGER NOT NULL DEFAULT 0 CHECK (interaction_count >= 0),
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  survey_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_interactions_user ON user_topic_interactions(user_id);
CREATE INDEX idx_interactions_topic ON user_topic_interactions(topic_id);
CREATE INDEX idx_interactions_user_topic ON user_topic_interactions(user_id, topic_id);
```

**Columns:**
- `id` - Interaction record identifier (UUID)
- `user_id` - Reference to user
- `topic_id` - Reference to topic
- `interaction_count` - Number of message exchanges (0-10)
- `is_locked` - Whether chat is locked (after 10 interactions)
- `survey_completed` - Whether post-topic survey is completed
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Unique Constraint:** One record per user-topic combination

---

### 6. ai_literacy_survey_responses

Stores responses to the one-time AI literacy survey.

```sql
CREATE TABLE ai_literacy_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  response_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX idx_literacy_survey_user ON ai_literacy_survey_responses(user_id);
```

**Columns:**
- `id` - Response identifier (UUID)
- `user_id` - Reference to user
- `question_id` - Identifier for the survey question
- `response_value` - User's response (text or number)
- `created_at` - Response timestamp

**Unique Constraint:** One response per user per question

---

### 7. post_topic_survey_responses

Stores responses to post-topic surveys (16 questions per topic).

```sql
CREATE TABLE post_topic_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  question_id VARCHAR(100) NOT NULL,
  response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id, question_id)
);

CREATE INDEX idx_post_topic_survey_user_topic ON post_topic_survey_responses(user_id, topic_id);
CREATE INDEX idx_post_topic_survey_user ON post_topic_survey_responses(user_id);
```

**Columns:**
- `id` - Response identifier (UUID)
- `user_id` - Reference to user
- `topic_id` - Reference to topic
- `question_id` - Identifier for the survey question
- `response_value` - Likert scale response (1-7)
- `created_at` - Response timestamp

**Unique Constraint:** One response per user per topic per question

---

### 8. global_guardrails

Stores the global guardrail policy that applies to all topics.

```sql
CREATE TABLE global_guardrails (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (id = 1)
);
```

**Columns:**
- `id` - Always 1 (single global guardrail)
- `title` - Guardrail title
- `content` - Guardrail policy text
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Note:** Only one record should exist in this table.

---

## Relationships

```
users (1) ──→ (many) messages
users (1) ──→ (many) user_topic_interactions
users (1) ──→ (many) ai_literacy_survey_responses
users (1) ──→ (many) post_topic_survey_responses
users (many) ──→ (1) agents [via assigned_agent_id]

topics (1) ──→ (many) messages
topics (1) ──→ (many) user_topic_interactions
topics (1) ──→ (many) post_topic_survey_responses
```

---

## Views

### User Progress View

```sql
CREATE VIEW user_progress AS
SELECT 
  u.id AS user_id,
  u.email,
  u.assigned_agent_id,
  u.current_topic_index,
  u.has_completed_literacy_survey,
  COUNT(DISTINCT uti.topic_id) FILTER (WHERE uti.survey_completed = TRUE) AS completed_topics,
  COUNT(DISTINCT uti.topic_id) AS total_interacted_topics
FROM users u
LEFT JOIN user_topic_interactions uti ON u.id = uti.user_id
GROUP BY u.id, u.email, u.assigned_agent_id, u.current_topic_index, u.has_completed_literacy_survey;
```

---

## Functions

### Update Updated At Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger for Users Table

```sql
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Trigger for Agents Table

```sql
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Trigger for Topics Table

```sql
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Trigger for User Topic Interactions Table

```sql
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON user_topic_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Seed Data

### Agents Seed

```sql
INSERT INTO agents (id, name, emotional_intelligence_level, cognitive_intelligence_level, system_prompt_template) VALUES
(1, 'Agent 1', 3, 7, 'You are a customer service agent with...'),
(2, 'Agent 2', 5, 5, 'You are a customer service agent with...'),
(3, 'Agent 3', 7, 3, 'You are a customer service agent with...'),
-- ... (9 total agents)
(9, 'Agent 9', 9, 9, 'You are a customer service agent with...');
```

### Topics Seed

```sql
INSERT INTO topics (id, title, stimulus_text, topic_specific_policy, order_index) VALUES
(1, 'Topic 1', 'Stimulus text for topic 1...', 'Policy for topic 1...', 1),
(2, 'Topic 2', 'Stimulus text for topic 2...', 'Policy for topic 2...', 2),
-- ... (20 total topics)
(20, 'Topic 20', 'Stimulus text for topic 20...', 'Policy for topic 20...', 20);
```

### Global Guardrails Seed

```sql
INSERT INTO global_guardrails (id, title, content) VALUES
(1, 'Global Guardrails', 'Global guardrail policy text...');
```

---

## Common Queries

### Get User's Current Topic Status

```sql
SELECT 
  t.*,
  COALESCE(uti.interaction_count, 0) AS interaction_count,
  COALESCE(uti.is_locked, FALSE) AS is_locked,
  COALESCE(uti.survey_completed, FALSE) AS survey_completed
FROM users u
JOIN topics t ON t.order_index = u.current_topic_index + 1
LEFT JOIN user_topic_interactions uti ON uti.user_id = u.id AND uti.topic_id = t.id
WHERE u.id = $1;
```

### Get Chat History for Topic

```sql
SELECT *
FROM messages
WHERE user_id = $1 AND topic_id = $2
ORDER BY timestamp ASC;
```

### Get User's Assigned Agent

```sql
SELECT a.*
FROM users u
JOIN agents a ON a.id = u.assigned_agent_id
WHERE u.id = $1;
```

### Check if Survey Required

```sql
SELECT 
  interaction_count >= 10 AS should_show_survey,
  survey_completed
FROM user_topic_interactions
WHERE user_id = $1 AND topic_id = $2;
```

### Get All Survey Responses for Analysis

```sql
-- AI Literacy Survey
SELECT 
  u.id AS user_id,
  u.assigned_agent_id,
  al.question_id,
  al.response_value
FROM ai_literacy_survey_responses al
JOIN users u ON u.id = al.user_id;

-- Post-Topic Survey
SELECT 
  u.id AS user_id,
  u.assigned_agent_id,
  pt.topic_id,
  pt.question_id,
  pt.response_value
FROM post_topic_survey_responses pt
JOIN users u ON u.id = pt.user_id;
```

---

## Migration Scripts

### Initial Migration

```sql
-- Run all CREATE TABLE statements above
-- Run all CREATE INDEX statements
-- Run all CREATE TRIGGER statements
-- Seed initial data
```

### Add Column Migration Example

```sql
-- Example: Adding a new column
ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
```

---

## Backup Strategy

1. **Daily Backups:** Full database backup at 2 AM UTC
2. **Retention:** Keep 7 daily backups, 4 weekly backups
3. **Before Major Changes:** Manual backup before schema changes

---

## Performance Optimization

### Indexes

All foreign keys and frequently queried columns are indexed.

### Query Optimization

- Use `EXPLAIN ANALYZE` to analyze query performance
- Monitor slow queries
- Consider materialized views for complex analytics

### Connection Pooling

- Recommended pool size: 10-20 connections
- Use connection pooling library (e.g., pg-pool)

---

## Data Retention

- **Messages:** Retain indefinitely (research data)
- **Survey Responses:** Retain indefinitely (research data)
- **User Accounts:** Retain indefinitely (research data)

No automatic deletion of research data.

---

## Security Considerations

1. **Row Level Security:** Consider implementing RLS for multi-tenant scenarios
2. **Encryption:** Use SSL/TLS for database connections
3. **Backups:** Encrypt database backups
4. **Access Control:** Limit database user permissions to minimum required

---

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for consistency
- UUIDs are used for primary keys where appropriate
- Foreign key constraints ensure referential integrity
- Check constraints enforce business rules at database level
- Unique constraints prevent duplicate data
