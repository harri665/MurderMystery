@echo off
REM Murder Mystery Deployment Helper Script (Windows)

if "%1"=="dev" goto dev
if "%1"=="build" goto build
if "%1"=="deploy" goto deploy
goto help

:dev
echo 🔧 Starting LOCAL development...
echo ✅ Using local backend (http://localhost:3001)
echo 🚀 Starting development server...
npm start
goto end

:build
echo 🏗️  Building production Docker containers...
docker-compose build --no-cache
echo ✅ Build complete!
echo 🚀 Run: docker-compose up -d
goto end

:deploy
echo 🚀 Deploying production containers...
docker-compose down
docker-compose build
docker-compose up -d
echo ✅ Deployment complete!
echo 🌐 Frontend: http://localhost:5080
echo 🔗 Backend: https://mysteryapi.harrison-martin.com
goto end

:help
echo Murder Mystery Deployment Helper
echo.
echo Usage: %0 {dev^|build^|deploy}
echo.
echo Commands:
echo   dev     - Start local development (localhost:3001 backend)
echo   build   - Build Docker containers (production backend)
echo   deploy  - Build and deploy to production
echo.
echo Environment:
echo   Development: Uses .env (localhost:3001)
echo   Production:  Uses .env.production in Docker (mysteryapi.harrison-martin.com)

:end