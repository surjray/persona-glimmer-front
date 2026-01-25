-- Create AI literacy survey responses table
CREATE TABLE IF NOT EXISTS ai_literacy_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  response_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_literacy_survey_user ON ai_literacy_survey_responses(user_id);

-- Create post-topic survey responses table
CREATE TABLE IF NOT EXISTS post_topic_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  question_id VARCHAR(100) NOT NULL,
  response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_post_topic_survey_user_topic ON post_topic_survey_responses(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_post_topic_survey_user ON post_topic_survey_responses(user_id);
