-- Supabase Schema for Math Drop Analytics
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- High Scores Table
CREATE TABLE IF NOT EXISTS high_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_name TEXT NOT NULL CHECK (LENGTH(player_name) <= 20),
  score INTEGER NOT NULL CHECK (score >= 0),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 2 AND 5),
  level INTEGER NOT NULL CHECK (level >= 1),
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) CHECK (accuracy BETWEEN 0 AND 100),
  session_duration INTEGER CHECK (session_duration >= 0), -- seconds
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Events Table (detailed analytics)
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'game_start', 'game_end', 'correct_answer', 'wrong_answer', 
    'level_up', 'equation_spawned', 'pause', 'resume'
  )),
  device_id TEXT,
  grade INTEGER CHECK (grade BETWEEN 2 AND 5),
  level INTEGER,
  score INTEGER,
  data JSONB DEFAULT '{}', -- flexible event-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_grade ON high_scores(grade);
CREATE INDEX IF NOT EXISTS idx_high_scores_device ON high_scores(device_id);
CREATE INDEX IF NOT EXISTS idx_game_events_type ON game_events(event_type);
CREATE INDEX IF NOT EXISTS idx_game_events_device ON game_events(device_id);
CREATE INDEX IF NOT EXISTS idx_game_events_created ON game_events(created_at);

-- Row Level Security (RLS) Policies
-- Allow anyone to read high scores
CREATE POLICY "Allow public read access" ON high_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON game_events
  FOR SELECT USING (true);

-- Allow anonymous inserts (we use device_id for deduplication)
CREATE POLICY "Allow anonymous inserts" ON high_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON game_events
  FOR INSERT WITH CHECK (true);

-- Enable RLS
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_high_scores_updated_at
  BEFORE UPDATE ON high_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for leaderboard (top 100 all-time)
CREATE OR REPLACE VIEW leaderboard_all_time AS
SELECT 
  player_name,
  score,
  grade,
  level,
  accuracy,
  created_at,
  ROW_NUMBER() OVER (ORDER BY score DESC) as rank
FROM high_scores
ORDER BY score DESC
LIMIT 100;

-- View for personal bests per device
CREATE OR REPLACE VIEW personal_bests AS
SELECT 
  device_id,
  player_name,
  MAX(score) as best_score,
  COUNT(*) as games_played,
  AVG(accuracy) as avg_accuracy
FROM high_scores
GROUP BY device_id, player_name;
