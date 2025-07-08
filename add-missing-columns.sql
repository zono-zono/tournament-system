-- Add missing columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS next_match_id UUID REFERENCES matches(id),
ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_matches_next_match_id ON matches(next_match_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_round ON matches(tournament_id, round_number);

-- Update existing matches to have updated_at timestamp
UPDATE matches SET updated_at = NOW() WHERE updated_at IS NULL;