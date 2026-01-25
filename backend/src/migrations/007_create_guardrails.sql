-- Create global guardrails table
CREATE TABLE IF NOT EXISTS global_guardrails (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (id = 1)
);
