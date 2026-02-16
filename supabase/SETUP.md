# Supabase Setup Guide

## Quick Start (One-Time Setup)

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Name: `math-drop-game`
5. Choose region closest to you
6. Click "Create new project"

### 2. Get Your Credentials
1. In your project dashboard, click ⚙️ **Settings**
2. Go to **API** tab
3. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Set Up Database
1. Go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy/paste the entire contents of `supabase/schema.sql`
4. Click **Run**
5. You should see "Success. No rows returned"

### 4. Configure Environment Variables
Create `.env` file in project root:

```bash
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from step 2.

### 5. Test Connection
```bash
npm run dev
# Open browser console, should see "Supabase connected" if configured
```

---

## What Gets Tracked

### High Scores
- Player name, score, grade, level reached
- Accuracy percentage, session duration
- Cross-device sync using anonymous device ID

### Analytics Events
- Game starts/ends with session data
- Every correct/wrong answer with timing
- Level up events
- Equation difficulty patterns

### Privacy
- No personal information collected
- Anonymous device fingerprint only
- Opt-out toggle in settings
- Works 100% offline without Supabase

---

## Local Development (No Supabase)

The app works perfectly without Supabase! Just skip steps above:
- High scores save to localStorage
- Analytics disabled silently
- No errors or warnings

Add Supabase later whenever you're ready.

---

## Dashboard Queries

### View Top Scores
```sql
SELECT * FROM leaderboard_all_time LIMIT 10;
```

### View Today's Games
```sql
SELECT 
  player_name,
  score,
  grade,
  created_at
FROM high_scores
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY score DESC;
```

### Average Accuracy by Grade
```sql
SELECT 
  grade,
  ROUND(AVG(accuracy), 2) as avg_accuracy,
  COUNT(*) as total_games
FROM high_scores
GROUP BY grade
ORDER BY grade;
```
