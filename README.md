# 🎯 Math Drop - Falling Equations V2

A polished, professional educational arcade game for grades 2-5. Equations fall from the sky — type the answer before they hit the ground!

**Live Game:** https://math-falling-equations-v2.vercel.app

![Game Screenshot](screenshot.png)

## Features

### Core Gameplay
- **Grade-specific difficulty** (2, 3, 4, 5) with age-appropriate equations
- **Progressive difficulty** — speeds up and gets harder as you level up
- **3 lives** — don't let equations hit the ground!
- **Score multiplier** — higher levels = more points per correct answer

### Math Operations by Grade
| Grade | Operations |
|-------|-----------|
| 2 | Addition, Subtraction (1-20) |
| 3 | + Multiplication, Division (2-12 tables) |
| 4 | + Fractions (like denominators) |
| 5 | + Fractions (unlike denominators) |

### Smart Answer Validation
Accepts ALL equivalent forms:
- `12/8` ✅
- `6/4` ✅
- `3/2` ✅
- `1 1/2` ✅
- `1.5` ✅

### Game Features
- 🐸 **Emoji monsters** with speech bubble reactions
- 🎵 **Procedural audio** (Tone.js synthesis)
- 💾 **High scores** with local + cloud sync (Supabase)
- ⚙️ **Settings** — volume controls, difficulty, analytics opt-out
- ⏸️ **Pause menu** — resume or quit
- 📊 **Analytics** — track gameplay (anonymous, optional)

## Tech Stack

- **Phaser 3.70+** — Game engine
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — UI styling
- **Tone.js** — Audio synthesis
- **Supabase** — Cloud database (optional)

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Deployment

```bash
# Deploy to Vercel
vercel --prod
```

## Project Structure

```
src/
  game/
    scenes/           # Phaser scenes (Menu, Game, GameOver, etc.)
    managers/         # Audio, state management
  math/               # Equation generation, answer validation
  analytics/          # Supabase integration, event tracking
  ui/                 # Styles, components
tests/                # Unit tests (Vitest)
supabase/             # Database schema, setup guide
```

## Configuration

Create `.env` file for Supabase (optional — game works 100% offline without it):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See `supabase/SETUP.md` for database setup instructions.

## License

MIT

---

Built with ❤️ by Raxor Red 🐉
