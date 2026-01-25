-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  assigned_agent_id INTEGER NOT NULL CHECK (assigned_agent_id BETWEEN 1 AND 9),
  current_topic_index INTEGER NOT NULL DEFAULT 0 CHECK (current_topic_index BETWEEN 0 AND 19),
  has_completed_literacy_survey BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_assigned_agent ON users(assigned_agent_id);
