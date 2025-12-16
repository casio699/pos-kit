#!/bin/bash

set -e

echo "🚀 KiTS Universal POS — Setup Script"
echo "======================================"
echo ""

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    echo "Install Node.js from: https://nodejs.org/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose is not available"
    echo "Make sure Docker Desktop is running (it includes docker compose)"
    exit 1
fi

# Set docker-compose command (use docker compose for Docker Desktop)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

echo "✅ All prerequisites found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing desktop-client dependencies..."
cd desktop-client
npm install
cd ..

echo "Installing web-frontend dependencies..."
cd web-frontend
npm install
cd ..

echo ""
echo "✅ Dependencies installed"
echo ""

# Start infrastructure
echo "🐳 Starting Docker infrastructure..."
$DOCKER_COMPOSE up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Docker services started"
echo ""

# Run migrations and seeding (optional)
cd backend

echo "🗄️  Checking for database migrations..."
if [ -d "src/database/migrations" ] || [ -d "dist/database/migrations" ]; then
  echo "🗄️  Running database migrations..."
  set +e
  npm run migrate:latest
  MIG_EXIT=$?
  set -e
  if [ "$MIG_EXIT" -eq 0 ]; then
    echo "✅ Database migrations complete"
  else
    echo "ℹ️  No migrations to run or migration command not configured. Skipping."
  fi
else
  echo "ℹ️  No migrations directory found. Skipping migrations."
fi

echo "🌱 Checking for seed script..."
if [ -f "src/database/seeds/demo.seed.ts" ] || [ -f "dist/database/seeds/demo.seed.js" ]; then
  echo "🌱 Seeding demo data..."
  set +e
  npm run seed:demo
  SEED_EXIT=$?
  set -e
  if [ "$SEED_EXIT" -eq 0 ]; then
    echo "✅ Seeding complete"
  else
    echo "ℹ️  Seed script failed or not configured. Skipping."
  fi
else
  echo "ℹ️  No seed file found. Skipping seeding."
fi

cd ..

echo ""

# Summary
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend API (in a new terminal):"
echo "   cd backend && npm run start:dev"
echo ""
echo "2. Start the web frontend tester (in another terminal):"
echo "   cd web-frontend && npm run dev"
echo ""
echo "3. Visit http://localhost:5173 to test the API"
echo ""
echo "4. Backend API is available at http://localhost:3000"
echo ""
echo "For more information, see:"
echo "  - README.md — Project overview"
echo "  - SETUP.md — Detailed setup instructions"
echo "  - TESTING_GUIDE.md — Testing instructions"
echo ""
