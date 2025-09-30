<!-- Murder Mystery Game - AI Coding Assistant Instructions

This file provides essential context for AI assistants working on the Murder Mystery game codebase.

## Architecture Overview

**Frontend**: React 19 + Vite + React Router v7 + Tailwind CSS v4 + Socket.IO client
- iPhone 4 themed UI with `IPhoneFrame` component wrapper
- JWT authentication via `AuthWrapper` component
- Real-time features using Socket.IO client

**Backend**: Node.js + Express 5 + Socket.IO server
- File-based JSON data storage in `server/data/`
- JWT authentication middleware
- REST API + WebSocket events for real-time updates

**Deployment**: Docker containers with Traefik reverse proxy
- Frontend: `murdermystery.harrison-martin.com` (port 5080)
- Backend: `mysteryapi.harrison-martin.com` (port 5081)

## Critical Developer Workflows

### Local Development
```bash
npm start  # Runs both frontend (5173) and backend (3001) concurrently
```

### Docker Development
```bash
docker-compose -f docker-compose.dev.yml up  # Backend only in container
npm run dev  # Frontend via Vite
```

### Production Deployment
```bash
docker-compose up -d  # Full stack with Traefik labels
```

## Key Patterns & Conventions

### Authentication Flow
- `AuthWrapper` component handles JWT verification and auto-login
- URL-based login: `/playername/` routes trigger automatic sign-in
- Token refresh every 6 days, expiration at 7 days
- Player data stored in localStorage as JSON

### Data Management
- JSON file storage with `readJSON()`/`writeJSON()` helpers
- Key data files: `game.json`, `players.json`, `messages.json`, `characters.json`
- Game state includes phases: LOBBY → RUN → WIN
- Real-time sync via Socket.IO events

### Component Structure
- Pages in `src/pages/`, components in `src/components/`
- All routes wrapped in `AuthWrapper` for authentication
- `IPhoneFrame` provides consistent iPhone 4 UI container
- Use `useOutletContext()` to access `signOut` function

### API Communication
- Frontend uses `import.meta.env.VITE_API_BASE` for API endpoint
- Development: `http://localhost:3001`
- Production: `https://mysteryapi.harrison-martin.com`
- JWT tokens sent in `Authorization: Bearer <token>` header

### Environment Configuration
- `.env.development`: `VITE_API_BASE=http://localhost:3001`
- `.env.production`: `VITE_API_BASE=https://mysteryapi.harrison-martin.com`
- Backend uses `process.env` for configuration

## Game Mechanics

### Core Systems
- **Players**: Characters with roles (killer/detective), abilities, and survey results
- **NFC Cards**: Riddle-based progression with poison/safe mechanics
- **Game Phases**: ACT_I (0-30min), ACT_II (30-75min), ACT_III (75min+)
- **Real-time Events**: Chat, presence, game state updates via Socket.IO

### Key Game Files
- `data/game.json`: Game state, timers, cooldowns, collected letters
- `data/players.json`: Player registry with roles and abilities
- `data/nfc_cards.json`: Riddle cards with normal/decoy content
- `data/characters.json`: Character definitions with goals/flaws/backstory

## Development Best Practices

### When Adding New Features
1. Check existing patterns in similar components/pages
2. Use established API endpoints or extend existing ones
3. Update data models in JSON files if needed
4. Test with both development and Docker environments
5. Ensure mobile-first responsive design within iPhone frame

### When Modifying Game Logic
1. Update both frontend state and backend JSON persistence
2. Emit Socket.IO events for real-time updates
3. Test cooldown timers and phase transitions
4. Verify authentication requirements for new endpoints

### When Adding New Pages
1. Create in `src/pages/` with consistent naming
2. Add route to `src/main.jsx` router configuration
3. Wrap with `AuthWrapper` if authentication required
4. Use `IPhoneFrame` for consistent UI container

## Common Pitfalls

- **Environment Variables**: Always use `VITE_` prefix for frontend env vars
- **Data Persistence**: Remember to call `writeJSON()` after modifying game state
- **Authentication**: Check `AuthWrapper` logic for token handling edge cases
- **Real-time Updates**: Don't forget to emit Socket.IO events after state changes
- **Docker Volumes**: Data files persist in `./server/data/` volume mounts

## File Organization Reference

```
src/
├── main.jsx           # Router setup with AuthWrapper
├── App.jsx            # Main app with IPhoneFrame
├── components/
│   ├── AuthWrapper.jsx    # JWT authentication logic
│   ├── IPhoneFrame.jsx    # iPhone UI container
│   └── SignIn.jsx         # Login component
├── pages/             # Route components
│   ├── Home.jsx       # iPhone home screen
│   ├── Profile.jsx    # Player profile
│   └── ...            # Other game pages
└── styles/index.css   # Tailwind imports

server/
├── index.mjs          # Express + Socket.IO server
├── package.json       # Backend dependencies
└── data/              # JSON data files
    ├── game.json
    ├── players.json
    └── ...

docker-compose.yml     # Production deployment
docker-compose.dev.yml # Development backend
```