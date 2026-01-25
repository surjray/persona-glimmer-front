-- Create user_topic_interactions table
CREATE TABLE IF NOT EXISTS user_topic_interactions (
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

CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_topic_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_topic ON user_topic_interactions(topic_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_topic ON user_topic_interactions(user_id, topic_id);
