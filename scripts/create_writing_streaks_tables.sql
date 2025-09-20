-- Create writing_goals table
CREATE TABLE IF NOT EXISTS writing_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily_essays', 'weekly_essays', 'monthly_essays', 'score_target')),
  target_value INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create writing_streaks table
CREATE TABLE IF NOT EXISTS writing_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_essay_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_writing_stats table for tracking daily activity
CREATE TABLE IF NOT EXISTS daily_writing_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  essays_written INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_writing_goals_user_id ON writing_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_goals_active ON writing_goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_writing_streaks_user_id ON writing_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_writing_stats_user_date ON daily_writing_stats(user_id, date);

-- Enable RLS (Row Level Security)
ALTER TABLE writing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_writing_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own writing goals" ON writing_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own writing goals" ON writing_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own writing goals" ON writing_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own writing goals" ON writing_goals
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own writing streaks" ON writing_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own writing streaks" ON writing_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own writing streaks" ON writing_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily writing stats" ON daily_writing_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily writing stats" ON daily_writing_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily writing stats" ON daily_writing_stats
  FOR UPDATE USING (auth.uid() = user_id);
