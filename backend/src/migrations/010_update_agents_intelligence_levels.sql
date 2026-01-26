-- Update agents table to use VARCHAR for intelligence levels instead of INTEGER
-- Convert existing numeric values to categorical values
-- This migration is idempotent - safe to run multiple times

-- Step 1: Check if columns are already VARCHAR (migration already run)
DO $$
BEGIN
  -- Check if emotional_intelligence_level is already VARCHAR
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' 
    AND column_name = 'emotional_intelligence_level' 
    AND data_type = 'character varying'
  ) THEN
    RAISE NOTICE 'Intelligence levels are already VARCHAR. Migration may have already been applied.';
    -- Ensure values are valid
    UPDATE agents SET
      emotional_intelligence_level = CASE
        WHEN emotional_intelligence_level IN ('low', 'medium', 'high') THEN emotional_intelligence_level
        WHEN emotional_intelligence_level::text IN ('1', '2', '3') THEN 'low'
        WHEN emotional_intelligence_level::text IN ('4', '5', '6', '7') THEN 'medium'
        WHEN emotional_intelligence_level::text IN ('8', '9', '10') THEN 'high'
        ELSE 'medium'
      END,
      cognitive_intelligence_level = CASE
        WHEN cognitive_intelligence_level IN ('low', 'medium', 'high') THEN cognitive_intelligence_level
        WHEN cognitive_intelligence_level::text IN ('1', '2', '3') THEN 'low'
        WHEN cognitive_intelligence_level::text IN ('4', '5', '6', '7') THEN 'medium'
        WHEN cognitive_intelligence_level::text IN ('8', '9', '10') THEN 'high'
        ELSE 'medium'
      END
    WHERE emotional_intelligence_level NOT IN ('low', 'medium', 'high')
       OR cognitive_intelligence_level NOT IN ('low', 'medium', 'high');
  ELSE
    -- Step 2: Add new columns
    ALTER TABLE agents 
    ADD COLUMN IF NOT EXISTS emotional_intelligence_level_new VARCHAR(10),
    ADD COLUMN IF NOT EXISTS cognitive_intelligence_level_new VARCHAR(10);

    -- Step 3: Convert existing numeric values to categorical
    -- 1-3 = low, 4-7 = medium, 8-10 = high
    UPDATE agents SET
      emotional_intelligence_level_new = CASE
        WHEN emotional_intelligence_level BETWEEN 1 AND 3 THEN 'low'
        WHEN emotional_intelligence_level BETWEEN 4 AND 7 THEN 'medium'
        WHEN emotional_intelligence_level BETWEEN 8 AND 10 THEN 'high'
        ELSE 'medium'
      END,
      cognitive_intelligence_level_new = CASE
        WHEN cognitive_intelligence_level BETWEEN 1 AND 3 THEN 'low'
        WHEN cognitive_intelligence_level BETWEEN 4 AND 7 THEN 'medium'
        WHEN cognitive_intelligence_level BETWEEN 8 AND 10 THEN 'high'
        ELSE 'medium'
      END;

    -- Step 4: Drop old columns
    ALTER TABLE agents 
    DROP COLUMN IF EXISTS emotional_intelligence_level,
    DROP COLUMN IF EXISTS cognitive_intelligence_level;

    -- Step 5: Rename new columns
    ALTER TABLE agents 
    RENAME COLUMN emotional_intelligence_level_new TO emotional_intelligence_level;

    ALTER TABLE agents 
    RENAME COLUMN cognitive_intelligence_level_new TO cognitive_intelligence_level;
  END IF;
END $$;

-- Step 6: Add CHECK constraints (drop first if they exist)
ALTER TABLE agents 
DROP CONSTRAINT IF EXISTS check_emotional_intelligence_level;

ALTER TABLE agents 
DROP CONSTRAINT IF EXISTS check_cognitive_intelligence_level;

ALTER TABLE agents 
ADD CONSTRAINT check_emotional_intelligence_level 
CHECK (emotional_intelligence_level IN ('low', 'medium', 'high'));

ALTER TABLE agents 
ADD CONSTRAINT check_cognitive_intelligence_level 
CHECK (cognitive_intelligence_level IN ('low', 'medium', 'high'));

-- Step 7: Make columns NOT NULL
ALTER TABLE agents 
ALTER COLUMN emotional_intelligence_level SET NOT NULL,
ALTER COLUMN cognitive_intelligence_level SET NOT NULL;
