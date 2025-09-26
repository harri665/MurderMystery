# Murder Mystery - Docker Deployment Guide

This guide will help you deploy the Murder Mystery website using Docker and Portainer with persistent storage.

## Files Created

- `docker-compose.yml` - Production setup with external API backend
- `Dockerfile.nginx-proxy` - Nginx proxy with frontend build and API routing
- `Dockerfile.backend` - Express server container (for backend server)
- `nginx-proxy.conf` - Nginx configuration for proxy and frontend
- `nginx.conf` - Simple nginx configuration for frontend only
- `.dockerignore` - Files to exclude from Docker build

## Persistent Storage

The application uses **persistent storage** to ensure your data survives container restarts:

- **Survey data**: `/app/data/survey_data.json`
- **Player data**: `/app/data/players.json`
- **Game data**: `/app/data/game.json`
- **Messages**: `/app/data/messages.json`
- **Contacts**: `/app/data/contacts.json`
- **NFC Cards**: `/app/data/nfc_cards.json`

All data is stored in the Docker volume `murdermystery_data` which persists across container restarts and updates.

## Deployment Options

### Option 1: Frontend Only (External Backend)
The current configuration assumes the backend is hosted at `mysteryapi.harrison-martin.com`.

```bash
docker-compose up -d
```
Access frontend at: http://localhost:5080
Backend API: https://mysteryapi.harrison-martin.com

### Option 2: Full Local Development
For local development with both frontend and backend:

1. **Start backend server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start frontend in development mode**:
   ```bash
   npm run dev
   ```

Access at: http://localhost:5173 (frontend) and http://localhost:3001 (backend)

### Option 3: Deploy Backend Server
To deploy the backend to your server (mysteryapi.harrison-martin.com):

1. **Copy server files** to your backend server
2. **Set environment variables** on the server:
   ```bash
   export PORT=3001
   export NODE_ENV=production
   export ORIGIN=https://murdermystery.harrison-martin.com,http://murdermystery.harrison-martin.com
   ```
3. **Start the backend**:
   ```bash
   cd server
   npm install --production
   npm start
   ```

## Environment Configuration

### Frontend Environment Variables
- `VITE_API_BASE` - Backend API URL (set to: https://mysteryapi.harrison-martin.com)

### Backend Environment Variables (for mysteryapi.harrison-martin.com server)
- `PORT` - Server port (default: 3001)
- `ORIGIN` - CORS allowed origins (should include your frontend domain)
- `NODE_ENV` - Environment mode (production)
- Game configuration variables:
  - `FINAL_CODE` - The final code for winning
  - `KILL_COOLDOWN` - Minutes between kills
  - `DOWN_MINUTES` - Minutes a player stays down
  - `UNPOISON_COOLDOWN` - Minutes between unpoison actions
  - `SAFE_MARK_MINUTES` - Minutes a location stays safe

## Port Configuration

### Development
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3001 (local development)

### Production
- Frontend (Docker): http://localhost:5080 (nginx proxy)
- Backend: https://mysteryapi.harrison-martin.com (external server)

## Data Persistence

The `murdermystery_data` volume ensures:
✅ Survey responses are never lost
✅ Player accounts persist across restarts  
✅ Game state is maintained
✅ Configuration survives updates

## Troubleshooting

### Container Logs
```bash
# View frontend logs
docker logs murdermystery-frontend

# View backend logs  
docker logs murdermystery-backend
```

### Data Volume Location
```bash
# Check volume details
docker volume inspect murdermystery_data

# Access volume data (if needed)
docker run --rm -v murdermystery_data:/data alpine ls -la /data
```

### Rebuild Containers
```bash
# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Security Notes

- Change default ports in production
- Use environment files for sensitive data
- Consider SSL/TLS termination with a reverse proxy
- Regular backups of the data volume are recommended

## Backup Strategy

```bash
# Backup data volume
docker run --rm -v murdermystery_data:/data -v $(pwd):/backup alpine tar czf /backup/murdermystery-backup.tar.gz /data

# Restore data volume
docker run --rm -v murdermystery_data:/data -v $(pwd):/backup alpine tar xzf /backup/murdermystery-backup.tar.gz -C /
```