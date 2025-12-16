# KiTS POS — Setup & Installation Guide

## Prerequisites

- **Node.js**: 18+ (LTS)
- **Docker**: Latest version
- **Docker Compose**: Latest version
- **Git**: Latest version
- **npm**: Comes with Node.js

## Quick Start (5 minutes)

### 1. Clone & Install

```bash
git clone <repo-url>
cd pos-kit

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Start Infrastructure

```bash
# Start all services (PostgreSQL, Redis, Kafka, Elasticsearch)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Setup Database

```bash
cd backend

# Run migrations
npm run migrate:latest

# Seed demo data
npm run seed:demo

cd ..
```

### 4. Start Backend API

```bash
cd backend
npm run start:dev
```

Backend will be available at:
- **REST API**: http://localhost:3000
- **GraphQL**: http://localhost:3000/graphql
- **Health Check**: http://localhost:3000/health

## Environment Setup

### Backend Configuration

Create `.env` file in `backend/` directory:

```bash
# Copy example
cp backend/.env.example backend/.env

# Edit with your values
nano backend/.env
```

**Key variables:**
- `DATABASE_HOST`: localhost (or docker service name)
- `DATABASE_USER`: pos_user
- `DATABASE_PASSWORD`: pos_password
- `DATABASE_NAME`: pos_kit
- `JWT_SECRET`: Change to secure random string
- `STRIPE_API_KEY`: Your Stripe test key (optional for MVP)

## Docker Services

### PostgreSQL
- **Port**: 5432
- **User**: pos_user
- **Password**: pos_password
- **Database**: pos_kit

Connect:
```bash
psql -h localhost -U pos_user -d pos_kit
```

### Redis
- **Port**: 6379

Test:
```bash
redis-cli ping
```

### Kafka
- **Port**: 9092
- **Zookeeper**: 2181

### Elasticsearch
- **Port**: 9200

Test:
```bash
curl http://localhost:9200/_cluster/health
```

## Development Workflow

### Running Backend

```bash
cd backend

# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build && npm run start:prod

# Debug mode
npm run start:debug
```

### Running Tests

```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

### Code Quality

```bash
cd backend

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Database Management

### Migrations

```bash
cd backend

# Create new migration
npm run migration:create -- --name=AddNewTable

# Run pending migrations
npm run migrate:latest

# Revert last migration
npm run migrate:down

# Show migration status
npm run migration:show
```

### Seeding

```bash
cd backend

# Seed demo data
npm run seed:demo

# Custom seed script
ts-node src/database/seeds/custom.seed.ts
```

## API Testing

### Using Postman

1. Import `docs/postman-collection.json`
2. Set environment variables
3. Test endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'

# Get products
curl -X GET http://localhost:3000/products?tenant_id=<tenant-id> \
  -H "Authorization: Bearer <token>"
```

### Using GraphQL

Visit http://localhost:3000/graphql and run queries:

```graphql
query {
  products(tenantId: "xxx") {
    id
    name
    sku
    price
  }
}
```

## Troubleshooting

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs -f

# Restart services
docker-compose restart

# Full reset
docker-compose down -v
docker-compose up -d
```

**Port already in use:**
```bash
# Find process using port
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Database Issues

**Connection refused:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

**Migration failed:**
```bash
# Check migration status
npm run migration:show

# Revert and retry
npm run migrate:down
npm run migrate:latest
```

### Backend Issues

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 in use:**
```bash
# Change port in .env
PORT=3001

# Or kill existing process
lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9
```

**TypeScript errors:**
```bash
# Rebuild
npm run build

# Type check
npm run type-check
```

## Production Deployment

### Docker Build

```bash
# Build image
docker build -t pos-kit-backend:latest ./backend

# Run container
docker run -p 3000:3000 \
  -e DATABASE_HOST=postgres \
  -e DATABASE_USER=pos_user \
  -e DATABASE_PASSWORD=pos_password \
  pos-kit-backend:latest
```

### Kubernetes

```bash
# Deploy with Terraform
cd terraform
terraform init
terraform apply

# Or use kubectl
kubectl apply -f k8s/
```

### Environment Variables (Production)

```bash
NODE_ENV=production
DATABASE_HOST=<rds-endpoint>
DATABASE_USER=<secure-user>
DATABASE_PASSWORD=<secure-password>
JWT_SECRET=<secure-random-key>
STRIPE_API_KEY=<live-key>
```

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Database
curl http://localhost:3000/health/db

# Redis
curl http://localhost:3000/health/redis
```

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
```

### Metrics

Access Prometheus at http://localhost:9090 (if enabled)

## Next Steps

1. **Create first tenant**: POST /tenants
2. **Create user**: POST /auth/register
3. **Add location**: POST /locations
4. **Add products**: POST /products
5. **Create sale**: POST /sales
6. **View reports**: GET /reports/dashboard

See `DEVELOPER_GUIDE.md` for detailed development instructions.

## Support

- **Documentation**: See `ARCHITECTURE.md`, `DEVELOPER_GUIDE.md`
- **API Reference**: See `openapi.yaml`
- **Issues**: GitHub Issues
- **Contact**: support@kits-pos.dev
