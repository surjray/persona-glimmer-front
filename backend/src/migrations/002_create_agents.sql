-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 9),
  name VARCHAR(255) NOT NULL,
  emotional_intelligence_level INTEGER NOT NULL CHECK (emotional_intelligence_level BETWEEN 1 AND 10),
  cognitive_intelligence_level INTEGER NOT NULL CHECK (cognitive_intelligence_level BETWEEN 1 AND 10),
  system_prompt_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
