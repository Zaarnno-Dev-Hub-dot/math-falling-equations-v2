# Math Falling Equations V2 - PRD

## Executive Summary
A polished, professional educational arcade game with AAA-quality polish. Clean, cute animation style with smooth 60fps gameplay, real audio synthesis, comprehensive testing, and delightful micro-interactions.

---

## Visual Design System

### Art Direction
**Style:** Clean, modern "cartoon" aesthetic inspired by:
- Nintendo's casual games (Animal Crossing, Nintendo Labo)
- Monument Valley's color palettes
- Duolingo's friendly, approachable UI

**Key Principles:**
- Rounded corners everywhere (buttons, cards, bubbles)
- Soft shadows with depth (not flat)
- Smooth, bouncy animations (spring physics)
- Consistent 8px spacing grid
- High contrast for readability

### Color Palette
```
Primary:      #FF6B6B (coral red - CTAs, highlights)
Secondary:    #4ECDC4 (turquoise - accents, success)
Tertiary:     #FFE66D (sunny yellow - stars, rewards)

Backgrounds:
  Sky Top:    #87CEEB → Sky Bottom: #E0F6FF (gradient)
  Ground:     #4CAF50 → #388E3C (gradient)
  UI Cards:   #FFFFFF (pure white, 95% opacity)

Text:
  Dark:       #2C3E50 (headings)
  Medium:     #5D6D7E (body)
  Light:      #95A5A6 (placeholders)

Semantic:
  Success:    #27AE60
  Error:      #E74C3C
  Warning:    #F39C12
```

### Typography
```
Display:      "Nunito Black" (900) - Title, big numbers
Heading:      "Nunito Bold" (700) - Section headers
Body:         "Nunito" (400) - UI text, equations
Input:        "Nunito Bold" (700) - Answer input

Fallback:     "Comic Neue", system-ui, sans-serif
```

### Animation Standards
```
Standard ease:      cubic-bezier(0.4, 0.0, 0.2, 1)
Bounce ease:        cubic-bezier(0.68, -0.55, 0.265, 1.55)
Spring ease:        cubic-bezier(0.175, 0.885, 0.32, 1.275)

Durations:
  Micro:    150ms (button presses, toggles)
  Short:    250ms (modal open/close, transitions)
  Medium:   400ms (screen transitions)
  Long:     600ms (celebrations, level up)
```

---

## Tech Stack

### Core Framework
- **Phaser 3.70+** - Game engine (physics, particles, scene management)
- **Web Audio API + Tone.js** - Procedural sound synthesis
- **CSS3 + Tailwind** - UI overlays, transitions
- **Vite** - Build tool (fast HMR, optimized builds)
- **TypeScript** - Type safety, better IDE support
- **Supabase** - Cloud database for analytics & cross-device high scores

### Audio System
All sounds synthesized procedurally (no external files needed):
- **Correct:** Chime + sparkle (sine + triangle waves)
- **Wrong:** Error buzz (sawtooth with decay)
- **Level Up:** Fanfare (arpeggio + chord progression)
- **BGM:** Lo-fi procedural loops (gentle, non-distracting)

### Testing Strategy

#### Unit Tests (Vitest)
```
src/
  math/
    __tests__/
      equation-generator.test.ts    (equation gen, difficulty scaling)
      validator.test.ts             (answer checking logic)
  game/
    __tests__/
      score-manager.test.ts         (score calc, level progression)
      state-machine.test.ts         (game state transitions)
```

#### Integration Tests
- Scene transitions
- Audio system initialization
- LocalStorage persistence

#### E2E Tests (Playwright)
- Full game flow: home → play → game over → high scores
- Mobile touch interactions
- Responsive layout breakpoints

#### Visual Regression (Chromatic/Storybook)
- All UI components in isolation
- Theme variations
- Animation states

---

## Game Architecture

### Scene Structure
```
BootScene        → Preload assets, init audio
MenuScene        → Home screen, grade selection
GameScene        → Main gameplay
GameOverScene    → Score display, save
HighScoreScene   → Leaderboard
SettingsScene    → Options
```

### Entity Components
```
FallingEquation
  - Text display
  - Physics body (arcade physics)
  - Glow effect on hover
  - Pop animation on destroy

Monster (3 emoji characters with CSS polish)
  - Base: Large emoji (🐸 🦊 🐰) with CSS filters/shadows
  - Idle: Gentle floating bounce (CSS animation)
  - Cheer: Jump + rotate + scale (CSS keyframes)
  - Sad: Slump + drop shadow (CSS transform)
  - Speech bubble: Dynamic text with tail
  - Particle overlays: CSS-based sparkles/hearts

ParticleEmitter
  - Star burst (correct)
  - Sparkle trail (level up)
  - Dust poof (wrong)
```

### State Management
```typescript
interface GameState {
  // Core
  currentScene: SceneType;
  isPaused: boolean;
  
  // Progress
  grade: 2 | 3 | 4 | 5;
  score: number;
  level: number;
  lives: number;
  streak: number;
  
  // Settings
  sfxVolume: number;      // 0-1
  musicVolume: number;    // 0-1
  difficulty: 'easy' | 'normal' | 'hard';
  
  // Stats
  totalPlayed: number;
  highScores: HighScore[];
}
```

---

## Feature Specifications

### 1. Home Screen
**Layout:**
- Full-screen animated sky (CSS parallax clouds)
- Centered card: white, rounded-3xl, shadow-xl
- Title: "Math Drop" with bouncing letters animation
- Subtitle: "Catch the equations!"

**Grade Selection:**
- 4 circular buttons (2, 3, 4, 5)
- Default: subtle scale(0.95), opacity 0.7
- Hover: scale(1.05), full opacity
- Selected: scale(1.1), coral border, gentle pulse animation
- Disabled play button until grade selected

**Navigation Buttons:**
- Primary (Play): Coral, white text, rounded-full, shadow
- Secondary (High Scores, Settings): White, coral text, border

**Monsters:**
- 2 monsters flanking the card
- Idle: Gentle floating animation
- On grade select: Quick excited hop

### 2. Gameplay Screen
**Canvas Layer (Phaser):**
- Sky gradient background (drawn once, cached)
- Cloud sprites (slow drift, parallax)
- Ground zone at bottom 15%
- Falling equations spawn at top, accelerate downward

**UI Overlay (HTML/CSS):**
- Top bar: Score | Level | Lives (hearts)
- Lives animate: Heart shake on loss, sparkle on gain
- Pause button: Top right, subtle until hover
- Input box: Bottom center, large, rounded-xl
  - Focus: Coral border glow
  - Wrong answer: Shake + red flash
  - Correct: Quick scale pulse + green flash

**Monster Reactions:**
- Correct: Jump + "Great!" bubble + star particles
- Wrong: Slump + "Oops!" bubble + sweat drop
- Level up: Spin + "Level Up!" + confetti burst

**Feedback Systems:**
- Particle explosions (correct answers)
- Screen flash (level up)
- Combo counter (x3, x5, x10 streaks)
- Floating +10, +20 score popups

### 3. Audio System

**SFX (Tone.js):**
```typescript
const sfx = {
  correct: () => {
    // High chime + sparkle
    const synth = new Tone.PolySynth().toDestination();
    synth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
  },
  
  wrong: () => {
    // Low buzz
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { decay: 0.3 }
    }).toDestination();
    synth.triggerAttackRelease('A2', '8n');
  },
  
  levelUp: () => {
    // Victory fanfare
    const synth = new Tone.PolySynth().toDestination();
    synth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '4n');
  }
};
```

**Background Music:**
- Lo-fi hip hop beat (procedural)
- 70-80 BPM (calm, non-distracting)
- Volume: 20% default (user adjustable)

### 4. Input System

**Number Pad Input (Mobile-Optimized):**
```typescript
interface InputConfig {
  type: 'numpad';           // Forces numeric keyboard on mobile
  allowFractions: boolean;  // true for grades 4-5
  allowDecimals: boolean;   // true for grade 5
  maxLength: number;        // Prevent overflow
}
```

**Visual Number Pad (Optional):**
- On-screen numpad for tablet/desktop users
- 0-9 buttons, backspace, enter
- Large touch targets (60px min)
- Haptic feedback on press (if supported)

**Input Behavior:**
- Auto-focus on game start
- Enter key submits answer
- Backspace clears last digit
- Visual feedback: Green glow (correct), Red shake (wrong)
- Fraction helper: Auto-formats "1/2" when "/" typed

### 6. Difficulty Progression

**Equation Generation by Grade:**

| Grade | Types | Examples | Max Answer |
|-------|-------|----------|------------|
| 2 | Add 1-10, Sub 1-10 | 5+3, 10-2 | 20 |
| 3 | Add 1-20, Sub 1-20, Mul 2-9, Div 2-9 | 12×3, 27÷9 | 100 |
| 4 | All + Fractions (like denominators) | 3/4 + 1/4 | Mixed |
| 5 | All + Fractions (unlike) + Decimals | 2.5×4, 3/4+1/2 | Mixed |

**Progressive Difficulty:**
- Level 1-3: Base speed, 3-second spawn interval
- Level 4-6: +20% speed, -200ms interval
- Level 7+: +40% speed, -400ms interval, harder equations
- Every 10 correct: Level up celebration

### 7. High Scores & Leaderboard
**Dual Storage Strategy:**
- **Local:** localStorage for offline play
- **Cloud:** Supabase for cross-device sync & global leaderboard

**Schema:**
```sql
-- High Scores Table
CREATE TABLE high_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 2 AND 5),
  level INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  accuracy DECIMAL(5,2),
  session_duration INTEGER, -- seconds
  created_at TIMESTAMP DEFAULT NOW(),
  device_id TEXT -- anonymous fingerprint for duplicate prevention
);

-- Analytics Events Table
CREATE TABLE game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'game_start', 'game_end', 'correct_answer', 'wrong_answer', 'level_up'
  grade INTEGER,
  level INTEGER,
  data JSONB, -- flexible event data
  created_at TIMESTAMP DEFAULT NOW(),
  device_id TEXT
);
```

**Leaderboard Features:**
- Global top 100 (all-time)
- Personal best per grade
- Recent activity feed
- Weekly/monthly filters (future)

### 8. Analytics System (Supabase)

**Tracked Events:**
```typescript
interface AnalyticsEvent {
  game_start: {
    grade: number;
    difficulty: string;
    timestamp: number;
  };
  
  game_end: {
    grade: number;
    final_score: number;
    final_level: number;
    duration_seconds: number;
    correct_count: number;
    wrong_count: number;
    accuracy: number;
  };
  
  answer_submitted: {
    equation: string;
    correct: boolean;
    time_to_answer_ms: number;
    grade: number;
    level: number;
  };
  
  level_up: {
    new_level: number;
    timestamp: number;
  };
}
```

**Metrics Dashboard (Future):**
- Average session length per grade
- Most difficult equation types
- Drop-off points (when do players quit?)
- Accuracy trends by grade/difficulty
- Peak play times

**Privacy:**
- Anonymous device fingerprint (no PII)
- Opt-out toggle in settings
- Local-first (works offline, syncs when connected)

---

## Testing Checklist

### Unit Tests (Must Pass Before Commit)
- [ ] Equation generator produces valid equations
- [ ] Equation difficulty scales with grade
- [ ] Answer validator handles integers, fractions, decimals
- [ ] Score manager calculates correctly
- [ ] Level progression triggers at correct intervals
- [ ] State machine transitions properly
- [ ] LocalStorage save/load works

### Visual Tests
- [ ] All animations run at 60fps
- [ ] Responsive at 320px, 768px, 1440px
- [ ] Touch targets ≥ 44px on mobile
- [ ] Color contrast WCAG AA compliant

### Audio Tests
- [ ] SFX play on correct/wrong/levelup
- [ ] BGM loops seamlessly
- [ ] Volume controls work
- [ ] Audio context resumes after user interaction

### Integration Tests
- [ ] Full game flow from home to game over
- [ ] Pause/resume preserves state
- [ ] App works offline (service worker)
- [ ] PWA install prompt appears

---

## File Structure

```
math-falling-equations-v2/
├── src/
│   ├── main.ts                 # Entry point
│   ├── game/
│   │   ├── Game.ts             # Main game config
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── GameScene.ts
│   │   │   ├── GameOverScene.ts
│   │   │   └── HighScoreScene.ts
│   │   ├── entities/
│   │   │   ├── FallingEquation.ts
│   │   │   ├── Monster.ts
│   │   │   └── ParticleEffects.ts
│   │   └── managers/
│   │       ├── ScoreManager.ts
│   │       ├── StateManager.ts
│   │       └── AudioManager.ts
│   ├── math/
│   │   ├── equation-generator.ts
│   │   ├── validator.ts
│   │   └── types.ts
│   ├── ui/
│   │   ├── components/
│   │   │   ├── GradeButton.ts
│   │   │   ├── ScoreDisplay.ts
│   │   │   └── MonsterPortrait.ts
│   │   └── styles/
│   │       └── variables.css
│   └── utils/
│       ├── storage.ts
│       └── helpers.ts
├── tests/
│   ├── unit/
│   │   ├── equation-generator.test.ts
│   │   ├── validator.test.ts
│   │   └── score-manager.test.ts
│   ├── e2e/
│   │   └── game-flow.spec.ts
│   └── visual/
│       └── components.stories.ts
├── public/
│   ├── sprites/                # Monster sprites (if using images)
│   └── fonts/                  # Nunito webfonts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Frame rate: Consistent 60fps
- Bundle size: < 200KB (gzipped)
- Lighthouse score: 95+ (Performance, Accessibility, Best Practices)

---

## Deployment

- Platform: Vercel (paid account)
- CI/CD: GitHub Actions
  - Run tests on PR
  - Deploy preview on PR
  - Deploy production on merge to main
- Monitoring: Vercel Analytics + Speed Insights

---

## Open Questions for @Zaarno

1. **Monsters:** Should I generate simple vector monsters in code, use emoji with CSS animations, or do you want custom art?
2. **Mobile:** Should the input be a number pad or full keyboard? (Number pad for math makes sense)
3. **Monetization:** Any plans for this? (Affects architecture decisions)
4. **Multiplayer:** Is the "race mode" in V1 still wanted, or pure single-player for now?
5. **Analytics:** Want to track gameplay metrics? (Average session length, most difficult equations, etc.)

---

**Status:** PRD Complete, awaiting feedback before coding begins.
