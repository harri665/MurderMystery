# Murder Mystery - Docker Deployment Guide

This guide will help you deploy the Murder Mystery website using Docker and Portainer with persistent storage.

## Files Created

- `docker-compose.yml` - Development setup
- `docker-compose.prod.yml` - Production setup for Portainer
- `Dockerfile.frontend` - React/Vite application container
- `Dockerfile.backend` - Express server container
- `nginx.conf` - Nginx configuration for frontend
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

### Option 1: Local Development
```bash
docker-compose up -d
```
Access at: http://localhost:3000

### Option 2: Production with Portainer

1. **Upload to your server** - Copy all files to your server
2. **Edit docker-compose.prod.yml** - Replace `your-server-ip` with your actual server IP
3. **Deploy in Portainer**:
   - Go to Portainer → Stacks
   - Click "Add Stack"
   - Name: `murdermystery`
   - Copy content from `docker-compose.prod.yml`
   - Replace `your-server-ip` with your server's IP address
   - Click "Deploy the stack"

### Option 3: Direct Server Deployment
```bash
# Replace YOUR_SERVER_IP with your actual IP
sed -i 's/your-server-ip/YOUR_SERVER_IP/g' docker-compose.prod.yml

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Frontend Environment Variables
- `VITE_API_BASE` - Backend API URL (default: http://localhost:3001)

### Backend Environment Variables
- `PORT` - Server port (default: 3001)
- `ORIGIN` - CORS allowed origins
- `NODE_ENV` - Environment mode

## Port Configuration

### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production
- Frontend: http://your-server-ip:80
- Backend: http://your-server-ip:3001

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