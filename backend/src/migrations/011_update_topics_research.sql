-- Add new columns to topics table for research study
-- domain: The service domain (e.g., 'Food Delivery', 'Ride-Hailing')
-- scenario_type: 'utilitarian' (functional loss) or 'hedonic' (experiential loss)
-- policy_pair_id: Which pair (1-10) this topic belongs to
-- initial_customer_message: The first message displayed in chat

ALTER TABLE topics
ADD COLUMN IF NOT EXISTS domain VARCHAR(50),
ADD COLUMN IF NOT EXISTS scenario_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS policy_pair_id INTEGER,
ADD COLUMN IF NOT EXISTS initial_customer_message TEXT;

-- Add index for policy pair lookups
CREATE INDEX IF NOT EXISTS idx_topics_policy_pair ON topics(policy_pair_id);
CREATE INDEX IF NOT EXISTS idx_topics_scenario_type ON topics(scenario_type);
