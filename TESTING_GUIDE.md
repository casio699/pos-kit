# KiTS POS — Testing Guide

## Quick Start Testing

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Install Backend Dependencies
```bash
cd backend && npm install && cd ..
```

### 3. Run Database Migrations
```bash
cd backend && npm run migrate:latest && cd ..
```

### 4. Seed Demo Data
```bash
cd backend && npm run seed:demo && cd ..
```

### 5. Start Backend API
```bash
cd backend && npm run start:dev
# API available at http://localhost:3000
```

### 6. Start Web Frontend Tester (in new terminal)
```bash
cd web-frontend && npm install && npm run dev
# Frontend available at http://localhost:5173
```

### 7. Run Tests
```bash
cd backend && npm run test
```

## Test Coverage

### Backend Unit Tests
- **Auth Service** — Registration, login, token generation
- **Products Service** — CRUD operations, SKU management
- **Inventory Service** — Stock adjustments, transfers
- **Sales Service** — Checkout, refunds
- **Purchase Orders Service** — PO creation, receiving

### Integration Tests
- Auth flow (register → login → access protected endpoints)
- Product creation and inventory tracking
- Sales transaction with inventory deduction
- Multi-location inventory transfers

### E2E Tests
- Complete checkout flow
- Inventory sync across locations
- Offline sync reconciliation

## API Test Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Authentication
```bash
# Register
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

### Products
```bash
# List products
curl -X GET "http://localhost:3000/products?tenant_id=test-tenant" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create product
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "sku": "SKU001",
    "name": "Test Product",
    "price": 99.99,
    "cost": 50.00
  }'
```

### Inventory
```bash
# Get inventory
curl -X GET "http://localhost:3000/inventory?tenant_id=test-tenant" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Adjust inventory
curl -X POST http://localhost:3000/inventory/adjust \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "product_id": "prod-1",
    "location_id": "main-store",
    "quantity": 10
  }'
```

### Sales
```bash
# Create sale
curl -X POST http://localhost:3000/sales \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "location_id": "main-store",
    "user_id": "user-1",
    "lines": [
      {
        "product_id": "prod-1",
        "quantity": 2,
        "unit_price": 50.00,
        "discount": 0
      }
    ],
    "total_amount": 100.00,
    "payment_method": "card"
  }'
```

## Web Frontend Tester

The web frontend at `http://localhost:5173` provides a visual test interface that:
- Tests all core API endpoints
- Shows real-time test results
- Displays response data
- Handles errors gracefully

Click "Run All Tests" to execute the complete test suite.

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### API Not Responding
```bash
# Check backend is running
curl http://localhost:3000/health

# View backend logs
docker-compose logs backend
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep node | awk '{print $2}' | xargs kill -9
```

## Performance Testing

### Load Testing (1000 sales/min)
```bash
cd backend && npm run test:load
```

### Stress Testing
```bash
cd backend && npm run test:stress
```

## Next Steps

1. **Desktop Client Testing** — Build and test Tauri desktop app
2. **Payment Integration** — Test Stripe payment flow
3. **E-commerce Sync** — Test Shopify bidirectional sync
4. **Offline Sync** — Test local SQLite + conflict resolution
5. **RBAC Testing** — Test role-based access control
6. **Audit Logs** — Verify complete audit trail

## CI/CD Testing

Tests run automatically on:
- Pull requests
- Commits to main branch
- Scheduled nightly runs

View results in GitHub Actions.
