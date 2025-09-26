# Backend Server Migration Summary

## 🔄 Migration to mysteryapi.harrison-martin.com

The Murder Mystery application has been updated to use `mysteryapi.harrison-martin.com` as the backend API server.

## 📝 Changes Made

### 1. Environment Configuration
- **`.env`** - Updated `VITE_API_BASE` to `https://mysteryapi.harrison-martin.com`
- **`.env.development`** - Created for local development with `http://localhost:3001`
- **`server/.env.production`** - Created for production backend server

### 2. Docker Configuration
- **`docker-compose.yml`** - Updated CORS origins and build args for new API URL
- **`Dockerfile.nginx-proxy`** - Created multi-stage build with frontend and nginx proxy
- **`nginx-proxy.conf`** - Created proxy configuration for external backend API

### 3. Scripts and Automation
- **`package.json`** - Added environment-specific scripts
- **`deploy.sh`** / **`deploy.bat`** - Created deployment helper scripts

### 4. Documentation
- **`README.md`** - Comprehensive project documentation
- **`DOCKER-DEPLOYMENT.md`** - Updated deployment guide
- **`BACKEND-MIGRATION.md`** - This summary document

## 🚀 Deployment Options

### Local Development (with local backend)
```bash
# Simply run the start command
npm start

# Or use the helper script
deploy.bat dev    # Windows
./deploy.sh dev   # Linux/Mac
```

### Production (with external backend via Docker)
```bash
# Build and deploy
docker-compose up -d

# Or use the helper script
deploy.bat deploy    # Windows
./deploy.sh deploy   # Linux/Mac
```

## 🔧 Environment Variables

### Automatic Environment Selection
- **Development** (npm start): Uses `.env` with `localhost:3001`
- **Production** (Docker): Uses `.env.production` with `mysteryapi.harrison-martin.com`

| Environment | File | VITE_API_BASE | Usage |
|-------------|------|---------------|-------|
| Development | `.env` | `http://localhost:3001` | `npm start` |
| Production | `.env.production` | `https://mysteryapi.harrison-martin.com` | Docker builds |

### Backend (mysteryapi.harrison-martin.com)
| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `ORIGIN` | Frontend domain(s) |

## 🌐 Access URLs

### Development
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Production
- **Frontend**: http://localhost:5080 (Docker)
- **Backend**: https://mysteryapi.harrison-martin.com

## ✅ Next Steps

1. **Deploy Backend**: Copy `server/` files to mysteryapi.harrison-martin.com
2. **Configure Environment**: Set up environment variables on the backend server
3. **Test Connection**: Verify frontend can connect to new backend
4. **SSL Setup**: Ensure HTTPS is properly configured for the backend
5. **CORS Configuration**: Add frontend domains to backend CORS settings

## 🔍 Testing

### Verify API Connection
```bash
# Test backend health endpoint
curl https://mysteryapi.harrison-martin.com/health

# Test from frontend console
fetch('https://mysteryapi.harrison-martin.com/api/game')
  .then(r => r.json())
  .then(console.log)
```

### WebSocket Connection
The frontend uses Socket.io to connect to the backend for real-time features like chat and presence.

## 📋 Checklist

- [x] Update environment variables
- [x] Configure Docker setup
- [x] Create proxy configuration  
- [x] Update documentation
- [x] Create deployment scripts
- [ ] Deploy backend server
- [ ] Test end-to-end functionality
- [ ] Configure SSL certificates
- [ ] Update DNS/domain settings

## 🛠️ Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure frontend domain is in backend ORIGIN env var
2. **SSL Issues**: Verify HTTPS certificates on mysteryapi.harrison-martin.com
3. **WebSocket Failures**: Check proxy configuration for WebSocket upgrade headers
4. **Build Failures**: Ensure VITE_API_BASE is set during build process

### Debug Commands
```bash
# Check environment variables
docker-compose config

# View container logs
docker logs murdermystery-proxy

# Test API connectivity
curl -v https://mysteryapi.harrison-martin.com/health
```