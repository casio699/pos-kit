# KiTS Universal POS — Installation Guide

## Prerequisites

Before starting, ensure you have the following installed:

### Required Tools

1. **Node.js 18+** (includes npm)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Docker**
   - Download: https://docs.docker.com/get-docker/
   - Verify: `docker --version`

3. **Docker Compose**
   - Download: https://docs.docker.com/compose/install/
   - Verify: `docker-compose --version`

4. **Git** (optional, for cloning)
   - Download: https://git-scm.com/

## Installation Steps

### Step 1: Verify Prerequisites

```bash
# Check Node.js
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher

# Check Docker
docker --version
docker-compose --version
```

If any command fails, install the missing tool from the links above.

### Step 2: Clone or Navigate to Project

```bash
# If cloning
git clone <repo-url>
cd pos-kit

# Or if already in the directory
cd /home/casio699/projects/pos-kit
```

### Step 3: Run Automated Setup (Linux/macOS)

```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run setup
./scripts/setup.sh
```

### Step 4: Manual Setup (Windows or if script fails)

```bash
# 1. Install backend dependencies
cd backend
npm install
cd ..

# 2. Install desktop client dependencies
cd desktop-client
npm install
cd ..

# 3. Install web frontend dependencies
cd web-frontend
npm install
cd ..

# 4. Start Docker infrastructure
docker-compose up -d

# 5. Wait for services to be ready (10-15 seconds)
# Then run migrations
cd backend
npm run migrate:latest
npm run seed:demo
cd ..
```

## Verify Installation

### Check Docker Services

```bash
docker-compose ps

# You should see:
# - postgres (healthy)
# - redis (healthy)
# - kafka (running)
# - zookeeper (running)
# - elasticsearch (running)
```

### Check Database Connection

```bash
# Connect to PostgreSQL
psql -h localhost -U pos_user -d pos_kit

# If successful, you'll see the psql prompt
# Type \q to exit
```

### Check Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

## Start the System

### Terminal 1: Start Backend API

```bash
cd backend
npm run start:dev

# You should see:
# [Nest] 12345  - 12/15/2025, 11:00:00 PM     LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - 12/15/2025, 11:00:02 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
# [Nest] 12345  - 12/15/2025, 11:00:03 PM     LOG [RoutesResolver] AppController {/}:
# [Nest] 12345  - 12/15/2025, 11:00:03 PM     LOG [NestApplication] Nest application successfully started
```

Backend is ready at: **http://localhost:3000**

### Terminal 2: Start Web Frontend Tester

```bash
cd web-frontend
npm run dev

# You should see:
# VITE v5.0.8  ready in 234 ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

Frontend is ready at: **http://localhost:5173**

### Terminal 3: Start Desktop Client (Optional)

```bash
cd desktop-client
npm run tauri:dev

# Tauri window will open with the desktop app
```

## Test the System

### Option 1: Web Frontend Tester (Easiest)

1. Open http://localhost:5173 in your browser
2. Click "Run All Tests" button
3. Watch the tests execute and see results

### Option 2: cURL Commands

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "first_name": "Test",
    "last_name": "User",
    "tenant_id": "test-tenant"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Option 3: Run Backend Tests

```bash
cd backend
npm run test              # Unit tests
npm run test:integration # Integration tests
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run start:dev
```

### Docker Services Not Starting

```bash
# Check Docker daemon is running
docker ps

# If not running, start Docker Desktop or daemon

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Permission Denied on setup.sh

```bash
# Make script executable
chmod +x scripts/setup.sh

# Run with bash explicitly
bash scripts/setup.sh
```

## Environment Variables

### Backend (.env)

Create `backend/.env` from `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=pos_user
DATABASE_PASSWORD=pos_password
DATABASE_NAME=pos_kit
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRATION=24h
STRIPE_API_KEY=sk_test_...
SHOPIFY_API_KEY=your-shopify-key
```

## Next Steps

1. **Explore the API** — Visit http://localhost:5173 and run tests
2. **Read Documentation** — Check README.md, ARCHITECTURE.md, DEVELOPER_GUIDE.md
3. **Run Backend Tests** — `cd backend && npm run test`
4. **Build Desktop Client** — `cd desktop-client && npm run tauri:build`
5. **Deploy** — Follow deployment instructions in DEVELOPER_GUIDE.md

## Support

- **Documentation** — See README.md, SETUP.md, TESTING_GUIDE.md
- **Issues** — Check troubleshooting section above
- **Development** — See DEVELOPER_GUIDE.md
- **Architecture** — See ARCHITECTURE.md

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disk | 5 GB | 20 GB |
| Node.js | 18.0.0 | 20.0.0+ |
| Docker | 20.10 | 24.0+ |

## Estimated Time

- Prerequisites check: 5 minutes
- Installation: 10-15 minutes
- Database setup: 2-3 minutes
- **Total: 20-25 minutes**

---

**Ready to build? Start with Step 1 above!**
