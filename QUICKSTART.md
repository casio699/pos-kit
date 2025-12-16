# KiTS Universal POS — Quick Start (5 Minutes)

## Prerequisites Check

Before starting, verify you have these installed:

```bash
node --version    # Should be v18+
npm --version     # Should be 9+
docker --version  # Should be 20.10+
docker-compose --version  # Should be 1.29+
```

**Don't have these?** See [INSTALL.md](INSTALL.md) for detailed installation instructions.

## One-Command Setup (Linux/macOS)

```bash
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

This will:
1. ✅ Install all dependencies
2. ✅ Start Docker infrastructure
3. ✅ Run database migrations
4. ✅ Seed demo data

Then follow the "Start the System" section below.

## Manual Setup (Windows or if script fails)

### 1. Install Dependencies (2 minutes)

```bash
# Backend
cd backend && npm install && cd ..

# Desktop client
cd desktop-client && npm install && cd ..

# Web frontend
cd web-frontend && npm install && cd ..
```

### 2. Start Infrastructure (1 minute)

```bash
docker-compose up -d
```

Wait 10 seconds for services to be ready.

### 3. Setup Database (1 minute)

```bash
cd backend
npm run migrate:latest
npm run seed:demo
cd ..
```

## Start the System

Open **3 terminals** and run these commands:

### Terminal 1: Backend API
```bash
cd backend && npm run start:dev
```
✅ API ready at http://localhost:3000

### Terminal 2: Web Tester
```bash
cd web-frontend && npm run dev
```
✅ Tester ready at http://localhost:5173

### Terminal 3: Desktop Client (Optional)
```bash
cd desktop-client && npm run tauri:dev
```
✅ Desktop app will open

## Test It

### Easiest: Web Tester
1. Open http://localhost:5173
2. Click "Run All Tests"
3. Watch all endpoints get tested

### Quick API Test
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

## What You Get

✅ **Backend API** — 11 modules, 30+ endpoints
✅ **Desktop Client** — Checkout, inventory, reports
✅ **Web Tester** — Interactive API testing
✅ **Database** — PostgreSQL with demo data
✅ **Full Documentation** — Architecture, guides, API specs

## Next Steps

- **Explore API** — Visit http://localhost:5173
- **Read Docs** — Check README.md, ARCHITECTURE.md
- **Run Tests** — `cd backend && npm run test`
- **Build Desktop** — `cd desktop-client && npm run tauri:build`

## Troubleshooting

**Port in use?**
```bash
lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9
```

**Docker not running?**
- Start Docker Desktop or daemon
- Then: `docker-compose up -d`

**npm install fails?**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Need help?** See [INSTALL.md](INSTALL.md) for detailed troubleshooting.

---

**That's it! You're ready to build. 🚀**
