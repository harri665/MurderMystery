# Murder Mystery Game

A React-based murder mystery game with real-time features.

## Development Setup

### Local Development (Recommended)
For development, run both frontend and backend locally:

```bash
npm install
npm start
```

This will:
- Start the backend server on `localhost:3001`
- Start the frontend dev server on `localhost:5173`
- Use `localhost:3001` for API calls

### Backend Only in Docker (Alternative)
If you want to run only the backend in Docker for development:

```bash
docker-compose -f docker-compose.dev.yml up
npm run dev  # In a separate terminal
```

## Production Deployment

### Docker Compose Production
For production deployment with custom domains:

```bash
docker-compose up -d
```

This will:
- Build and run the frontend container on port `5080` (mapped to `mudermystery.harrison-martin.com`)
- Build and run the backend container on port `5081` (mapped to `mysteryapi.harrison-martin.com`)
- Configure the frontend to use `https://mysteryapi.harrison-martin.com` for API calls

### Environment Configuration

- **Development**: Uses `.env.development` with `localhost:3001` API
- **Production**: Uses `.env.production` with `https://mysteryapi.harrison-martin.com` API

## Domain Configuration

The application is configured for these domains:
- Frontend: `mudermystery.harrison-martin.com` → Port `5080`
- Backend API: `mysteryapi.harrison-martin.com` → Port `5081`

Make sure your reverse proxy (nginx, Traefik, etc.) or DNS is configured to point these domains to the appropriate ports.

## Environment Variables

Key environment variables:
- `VITE_API_BASE`: API endpoint URL
- `PORT`: Server port (default: 3001)
- `ORIGIN`: Allowed CORS origins
- `NODE_ENV`: Environment mode

## Project Structure

```
├── src/                 # React frontend source
├── server/             # Express backend source
├── docker-compose.yml  # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
├── Dockerfile.frontend # Frontend container
├── Dockerfile.backend  # Backend container
└── nginx.conf         # Nginx configuration for frontend
```