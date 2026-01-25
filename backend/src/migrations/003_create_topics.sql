-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 20),
  title VARCHAR(255) NOT NULL,
  stimulus_text TEXT NOT NULL,
  topic_specific_policy TEXT NOT NULL,
  order_index INTEGER NOT NULL UNIQUE CHECK (order_index BETWEEN 1 AND 20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(order_index);
