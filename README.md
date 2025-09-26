# Murder Mystery Game

A corporate-themed murder mystery investigation game with real-time multiplayer features.

## 🏢 About

**Blackwood Corporate Tower - Investigation System**

An immersive murder mystery game set in a corporate environment where players take on roles as investigators, infiltrators, and analysts to solve the case.

## 🚀 Quick Start

### Development Mode (Local Backend)
```bash
# Install dependencies
npm install

# Start both frontend and backend locally
npm start
```

Access the game at: http://localhost:5173
Backend API at: http://localhost:3001

### Production Deployment (External Backend)
```bash
# Build and run with Docker
docker-compose up -d
```

Access at: http://localhost:5080
Backend API: https://mysteryapi.harrison-martin.com

## 🔧 Configuration

### Environment Setup
- **Development**: Uses `.env` with `VITE_API_BASE=http://localhost:3001`
- **Production (Docker)**: Uses `.env.production` with `VITE_API_BASE=https://mysteryapi.harrison-martin.com`

### Environment Variables

**Development (.env)**
- `VITE_API_BASE=http://localhost:3001` - Local backend server
- `NODE_ENV=development`

**Production (.env.production)**
- `VITE_API_BASE=https://mysteryapi.harrison-martin.com` - External backend server
- `NODE_ENV=production`

## 🎮 Game Features

- **Role-based gameplay** - Players are assigned roles through personality assessment
- **Real-time chat** - WebSocket-powered communication
- **NFC tag integration** - Physical location-based gameplay
- **Admin dashboard** - Game management and monitoring
- **Data persistence** - Survey responses and game state saved

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: JSON file storage with Docker volume persistence
- **Proxy**: Nginx for API routing and static file serving

## 📦 Docker Setup

The application uses Docker for containerized deployment:

- **Frontend**: Built with Vite and served via Nginx proxy
- **Backend**: External API server at mysteryapi.harrison-martin.com
- **Data Persistence**: Docker volume for game data

See `DOCKER-DEPLOYMENT.md` for detailed deployment instructions.

## 🔍 Game Roles

Players are assigned roles based on personality assessment:

- 🎭 **Corporate Infiltrator** - Stealth and deception specialist
- 🔍 **Lead Investigator** - Systematic fact-checking expert  
- 📢 **Case Coordinator** - Team communication leader
- 💻 **Digital Forensics Specialist** - Data analysis expert
- 🗺️ **Tactical Coordinator** - Strategic planning specialist

## 📱 Game Flow

1. **Registration** - Players join via personality survey
2. **Lobby** - Real-time player roster and chat
3. **Investigation** - NFC tag interactions and clue collection
4. **Resolution** - Final code submission and case solving

## 🛠️ Development

### Project Structure
```
├── src/              # React frontend source
│   ├── components/   # Reusable UI components  
│   ├── pages/        # Route pages
│   └── styles/       # CSS files
├── server/           # Backend API server
│   ├── data/         # JSON data storage
│   └── index.mjs     # Express server
├── public/           # Static assets
└── docker/           # Docker configuration
```

### Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build production frontend
- `npm run server` - Start backend server
- `npm start` - Start both frontend and backend

## 🔒 Security

- CORS configuration for frontend domains
- Environment variable protection
- Secure WebSocket connections
- Input validation and sanitization

## 📊 Data Management

Game data is persisted in JSON files:
- `players.json` - Player accounts and roles
- `game.json` - Game state and configuration
- `survey_data.json` - Personality assessment responses
- `messages.json` - Chat history
- `contacts.json` - Contact form submissions
- `nfc_cards.json` - NFC tag data

## 🚧 Production Deployment

1. **Backend Server**: Deploy to mysteryapi.harrison-martin.com
2. **Frontend**: Build and deploy via Docker or static hosting
3. **Environment**: Configure CORS and API endpoints
4. **SSL**: Enable HTTPS for secure WebSocket connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.