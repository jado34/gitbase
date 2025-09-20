-- Function to update writing streak when a new essay is submitted
CREATE OR REPLACE FUNCTION update_writing_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  current_streak_record RECORD;
  days_since_last_essay INTEGER;
BEGIN
  -- Get or create streak record for user
  SELECT * INTO current_streak_record 
  FROM writing_streaks 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO writing_streaks (user_id, current_streak, longest_streak, last_essay_date, streak_start_date)
    VALUES (p_user_id, 1, 1, today_date, today_date);
    RETURN;
  END IF;
  
  -- If user already wrote today, don't update streak
  IF current_streak_record.last_essay_date = today_date THEN
    RETURN;
  END IF;
  
  -- Calculate days since last essay
  days_since_last_essay := today_date - current_streak_record.last_essay_date;
  
  IF days_since_last_essay = 1 THEN
    -- Continue streak
    UPDATE writing_streaks 
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_essay_date = today_date,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF days_since_last_essay > 1 THEN
    -- Reset streak
    UPDATE writing_streaks 
    SET 
      current_streak = 1,
      last_essay_date = today_date,
      streak_start_date = today_date,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Same day, just update last essay date
    UPDATE writing_streaks 
    SET 
      last_essay_date = today_date,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily writing stats
CREATE OR REPLACE FUNCTION update_daily_stats(p_user_id UUID, p_word_count INTEGER, p_score NUMERIC)
RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO daily_writing_stats (user_id, date, essays_written, total_words, average_score)
  VALUES (p_user_id, today_date, 1, p_word_count, p_score)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    essays_written = daily_writing_stats.essays_written + 1,
    total_words = daily_writing_stats.total_words + p_word_count,
    average_score = (daily_writing_stats.average_score * daily_writing_stats.essays_written + p_score) / (daily_writing_stats.essays_written + 1),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  goal_record RECORD;
  current_progress INTEGER;
BEGIN
  -- Update progress for all active goals
  FOR goal_record IN 
    SELECT * FROM writing_goals 
    WHERE user_id = p_user_id AND is_active = true AND period_end >= CURRENT_DATE
  LOOP
    IF goal_record.goal_type = 'daily_essays' THEN
      SELECT COALESCE(essays_written, 0) INTO current_progress
      FROM daily_writing_stats 
      WHERE user_id = p_user_id AND date = CURRENT_DATE;
    ELSIF goal_record.goal_type = 'weekly_essays' THEN
      SELECT COALESCE(SUM(essays_written), 0) INTO current_progress
      FROM daily_writing_stats 
      WHERE user_id = p_user_id 
        AND date >= date_trunc('week', CURRENT_DATE)
        AND date <= CURRENT_DATE;
    ELSIF goal_record.goal_type = 'monthly_essays' THEN
      SELECT COALESCE(SUM(essays_written), 0) INTO current_progress
      FROM daily_writing_stats 
      WHERE user_id = p_user_id 
        AND date >= date_trunc('month', CURRENT_DATE)
        AND date <= CURRENT_DATE;
    ELSIF goal_record.goal_type = 'score_target' THEN
      SELECT COALESCE(MAX(overall_score), 0) INTO current_progress
      FROM essays 
      WHERE user_id = p_user_id 
        AND created_at >= goal_record.period_start
        AND created_at <= goal_record.period_end + INTERVAL '1 day';
    END IF;
    
    UPDATE writing_goals 
    SET current_progress = current_progress, updated_at = NOW()
    WHERE id = goal_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
