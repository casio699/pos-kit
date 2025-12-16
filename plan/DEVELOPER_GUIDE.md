# KiTS Universal POS — Developer Guide

## Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- Docker & Docker Compose
- Git
- PostgreSQL 15+ (or use Docker)
- Redis (or use Docker)
- Kafka (or use Docker)

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/pos-kit.git
   cd pos-kit
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install && cd ..
   
   # Desktop client
   cd desktop-client && npm install && cd ..
   ```

3. **Start the full stack**:
   ```bash
   docker-compose up -d
   ```
   This spins up:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Kafka (port 9092)
   - Elasticsearch (port 9200)
   - Backend API (port 3000)

4. **Run database migrations**:
   ```bash
   cd backend && npm run migrate:latest && cd ..
   ```

5. **Seed demo data**:
   ```bash
   cd backend && npm run seed:demo && cd ..
   ```

6. **Start the desktop client** (in a new terminal):
   ```bash
   cd desktop-client && npm run tauri dev
   ```
   The client will open on `http://localhost:1420` (Tauri dev server).

7. **Verify setup**:
   - Backend API: `curl http://localhost:3000/health`
   - PostgreSQL: `psql -h localhost -U pos_user -d pos_kit`
   - Redis: `redis-cli ping`

---

## Project Structure

```
pos-kit/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── auth/              # Authentication & RBAC
│   │   ├── products/          # Product catalog
│   │   ├── inventory/         # Inventory management
│   │   ├── warehouse/         # Multi-location, bins
│   │   ├── purchase-orders/   # PO workflows
│   │   ├── sales/             # Checkout & transactions
│   │   ├── stock-movements/   # Event sourcing ledger
│   │   ├── integrations/      # Payment, e-commerce, accounting
│   │   ├── reporting/         # Dashboards & reports
│   │   ├── devices/           # Hardware management
│   │   ├── sync/              # Offline sync & conflict resolution
│   │   ├── webhooks/          # Event subscriptions
│   │   ├── common/            # Shared utilities, guards, middleware
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   ├── test/                  # Unit & integration tests
│   ├── migrations/            # TypeORM migrations
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
│
├── desktop-client/            # Tauri + React desktop app
│   ├── src/
│   │   ├── components/        # React components (checkout, inventory, reports)
│   │   ├── pages/             # Main screens
│   │   ├── services/          # API client, local DB, sync agent
│   │   ├── store/             # State management (Redux/Zustand)
│   │   ├── hardware/          # USB/HID/Serial drivers
│   │   ├── offline/           # Local event log, conflict resolution
│   │   ├── utils/             # Helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── src-tauri/             # Tauri Rust backend
│   │   └── src/main.rs        # Tauri window & system integration
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── workers/                   # Async job processors
│   ├── po-processor/          # PO ingestion, auto-reorder
│   ├── forecast-engine/       # Demand forecasting
│   ├── reconciliation/        # Inventory reconciliation
│   ├── notification-service/  # Email, SMS, push alerts
│   └── Dockerfile
│
├── integrations/              # Integration adapters
│   ├── stripe/                # Payment gateway
│   ├── shopify/               # E-commerce sync
│   ├── quickbooks/            # Accounting export
│   ├── zebra-printer/         # Label printing
│   └── shippo/                # Carrier APIs
│
├── terraform/                 # Infrastructure as Code
│   ├── vpc.tf
│   ├── rds.tf
│   ├── redis.tf
│   ├── eks.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── .github/workflows/         # CI/CD pipelines
│   ├── backend-ci.yml
│   ├── desktop-ci.yml
│   └── deploy.yml
│
├── docs/
│   ├── API.md                 # API reference
│   ├── ARCHITECTURE.md        # System design
│   ├── DEVICE_INTEGRATION.md  # Hardware setup
│   └── ADMIN_MANUAL.md        # Operations guide
│
├── docker-compose.yml         # Full stack local dev
├── WINDSURF_AI_PROMPT.md      # Windsurf AI specification
├── openapi.yaml               # OpenAPI schema
├── ARCHITECTURE.md            # Architecture overview
├── DEVELOPER_GUIDE.md         # This file
└── README.md                  # Project overview
```

---

## Backend Development

### Running the Backend

```bash
cd backend

# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build && npm run start:prod

# Run tests
npm run test                    # Unit tests
npm run test:integration       # Integration tests
npm run test:e2e              # End-to-end tests
```

### Database Migrations

```bash
# Create a new migration
npm run migration:create -- --name=AddColumnX

# Run pending migrations
npm run migrate:latest

# Revert last migration
npm run migrate:down

# Seed demo data
npm run seed:demo
```

### API Documentation

- **OpenAPI/Swagger**: `http://localhost:3000/api/docs`
- **GraphQL Playground**: `http://localhost:3000/graphql`
- **Postman Collection**: See `docs/postman-collection.json`

### Key Modules

#### Auth Module
```typescript
// src/auth/auth.service.ts
- login(email, password)
- refreshToken(refreshToken)
- validateToken(token)
- createUser(userData)
```

#### Products Module
```typescript
// src/products/products.service.ts
- createProduct(productData)
- getProduct(id)
- listProducts(filters)
- updateProduct(id, data)
- deleteProduct(id)
```

#### Inventory Module
```typescript
// src/inventory/inventory.service.ts
- getInventory(locationId, productId)
- adjustInventory(productId, locationId, quantity, reason)
- transferInventory(productId, fromLocation, toLocation, quantity)
- getStockMovements(filters)
- getLowStock(locationId)
```

#### Sales Module
```typescript
// src/sales/sales.service.ts
- createSale(saleData)
- getSale(id)
- listSales(filters)
- refundSale(saleId, amount, reason)
- returnSale(saleId, lineIds)
```

#### Purchase Orders Module
```typescript
// src/purchase-orders/po.service.ts
- createPO(poData)
- getPO(id)
- listPOs(filters)
- receivePO(poId, receiveData)
- cancelPO(poId)
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- inventory.service.spec.ts

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Style & Linting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## Desktop Client Development

### Running the Desktop Client

```bash
cd desktop-client

# Development mode (with hot reload)
npm run tauri dev

# Build for production
npm run tauri build

# Run tests
npm run test
```

### Key Components

#### Checkout Screen
```typescript
// src/pages/Checkout.tsx
- Barcode scanning integration
- Item search & add to cart
- Payment processing (Stripe Terminal)
- Receipt printing
- Offline queue handling
```

#### Inventory Dashboard
```typescript
// src/pages/Inventory.tsx
- Real-time stock levels
- Stock adjustments
- Transfers between locations
- Low-stock alerts
```

#### Purchase Orders
```typescript
// src/pages/PurchaseOrders.tsx
- Create POs
- Receive goods
- Supplier management
```

#### Reports
```typescript
// src/pages/Reports.tsx
- Sales summary
- Inventory health
- Custom report builder
- Export to CSV/JSON
```

### Local Storage & Sync

```typescript
// src/services/localDb.ts
- initializeLocalDB()
- saveEvent(event)
- getUnsyncedEvents()
- markEventSynced(eventId)

// src/services/syncAgent.ts
- startSync()
- batchAndSend(events)
- handleConflict(conflict)
- applyServerEvents(events)
```

### Hardware Integration

```typescript
// src-tauri/src/main.rs
- USB device enumeration
- Barcode scanner driver
- Receipt printer (ESC/POS, ZPL)
- Payment terminal integration
- Cash drawer control
```

### State Management

```typescript
// src/store/
- authSlice.ts (user, token, permissions)
- inventorySlice.ts (stock levels, movements)
- salesSlice.ts (cart, transactions)
- syncSlice.ts (sync status, conflicts)
```

---

## Integration Development

### Adding a New Payment Gateway

1. Create adapter in `integrations/new-gateway/`:
   ```typescript
   // integrations/new-gateway/adapter.ts
   export class NewGatewayAdapter implements PaymentGateway {
     async authorize(amount, card) { ... }
     async capture(authId, amount) { ... }
     async refund(transactionId, amount) { ... }
   }
   ```

2. Register in `src/integrations/payment.service.ts`:
   ```typescript
   const adapter = new NewGatewayAdapter(config);
   this.gateways.set('new-gateway', adapter);
   ```

3. Add tests in `integrations/new-gateway/__tests__/`

### Adding E-Commerce Sync

1. Create adapter in `integrations/new-platform/`:
   ```typescript
   // integrations/new-platform/adapter.ts
   export class NewPlatformAdapter implements EcommercePlatform {
     async syncInventory(products) { ... }
     async syncOrders(orders) { ... }
     async updatePrice(productId, price) { ... }
   }
   ```

2. Register in `src/integrations/ecommerce.service.ts`

3. Set up webhook handlers for order/inventory updates

---

## Testing Strategy

### Unit Tests
```bash
# Test a specific module
npm run test -- src/inventory/inventory.service.spec.ts

# Test with coverage
npm run test:cov
```

**Target**: 80% coverage on core services

### Integration Tests
```bash
# Run integration tests (requires Docker services)
npm run test:integration
```

**Scope**: API + database interactions, multi-tenant isolation

### E2E Tests
```bash
# Run end-to-end tests
npm run test:e2e
```

**Scope**: Full workflows (offline sale → sync, multi-terminal checkout, PO receive)

### Load Testing
```bash
# Run load test (1000 sales/min across 500 tenants)
npm run test:load
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### Backend CI (`.github/workflows/backend-ci.yml`)
1. Lint (ESLint)
2. Unit tests
3. Integration tests
4. Build Docker image
5. Push to registry
6. Deploy to staging (canary)

#### Desktop CI (`.github/workflows/desktop-ci.yml`)
1. Lint
2. Unit tests
3. Build Tauri app (Windows, macOS, Linux)
4. Sign & notarize (macOS)
5. Upload artifacts

#### Deploy (`.github/workflows/deploy.yml`)
1. Triggered on merge to `main`
2. Build & push Docker images
3. Update Kubernetes deployments
4. Run smoke tests
5. Canary rollout (10% → 50% → 100%)

### Manual Deployment

```bash
# Deploy to staging
kubectl set image deployment/pos-backend pos-backend=registry/pos-backend:v1.2.3 -n staging

# Deploy to production
kubectl set image deployment/pos-backend pos-backend=registry/pos-backend:v1.2.3 -n production
```

---

## Environment Variables

### Backend (`.env`)
```bash
# Database
DATABASE_URL=postgresql://pos_user:password@localhost:5432/pos_kit
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Payment Gateways
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADYEN_API_KEY=...

# E-Commerce
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...

# Integrations
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=pos-kit-backups

# Observability
SENTRY_DSN=...
LOG_LEVEL=info
```

### Desktop Client (`.env`)
```bash
VITE_API_URL=http://localhost:3000
VITE_GRAPHQL_URL=http://localhost:3000/graphql
VITE_ENV=development
```

---

## Debugging

### Backend Debugging

```bash
# Run with Node debugger
node --inspect-brk dist/main.js

# Connect with Chrome DevTools
chrome://inspect
```

### Desktop Client Debugging

```bash
# Open DevTools in Tauri window
# Press Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (macOS)
```

### Database Debugging

```bash
# Connect to PostgreSQL
psql -h localhost -U pos_user -d pos_kit

# View tables
\dt

# View migrations
SELECT * FROM typeorm_migrations;

# Check inventory state at timestamp
SELECT * FROM stock_movements 
WHERE created_at <= '2024-01-15 10:30:00'
ORDER BY created_at DESC;
```

### Kafka Debugging

```bash
# List topics
kafka-topics.sh --list --bootstrap-server localhost:9092

# Consume messages
kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic stock-events --from-beginning

# Check consumer groups
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092
```

---

## Common Tasks

### Add a New API Endpoint

1. Create controller method in `src/module/module.controller.ts`:
   ```typescript
   @Post('endpoint')
   @UseGuards(AuthGuard)
   async createEndpoint(@Body() data: CreateDto) {
     return this.service.create(data);
   }
   ```

2. Add service method in `src/module/module.service.ts`:
   ```typescript
   async create(data: CreateDto) {
     // Business logic
   }
   ```

3. Add DTO in `src/module/dto/create.dto.ts`:
   ```typescript
   export class CreateDto {
     @IsString() name: string;
     @IsNumber() quantity: number;
   }
   ```

4. Add tests in `src/module/module.service.spec.ts`

5. Update OpenAPI schema in `openapi.yaml`

### Add a New Database Entity

1. Create entity in `src/module/entities/entity.entity.ts`:
   ```typescript
   @Entity()
   export class Entity {
     @PrimaryGeneratedColumn('uuid')
     id: string;
     
     @Column()
     name: string;
   }
   ```

2. Create migration:
   ```bash
   npm run migration:create -- --name=CreateEntity
   ```

3. Update migration file with schema

4. Run migration:
   ```bash
   npm run migrate:latest
   ```

### Add a New Integration

1. Create adapter in `integrations/new-service/`
2. Implement interface (PaymentGateway, EcommercePlatform, etc.)
3. Register in appropriate service
4. Add webhook handlers if needed
5. Add tests
6. Document in `docs/INTEGRATIONS.md`

---

## Performance Optimization

### Database Optimization

```typescript
// Use indexes for frequently queried columns
@Index()
@Column()
sku: string;

// Use pagination for large result sets
const [items, total] = await this.repo.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});

// Use select to fetch only needed columns
const items = await this.repo.find({
  select: ['id', 'name', 'sku'],
});
```

### Caching

```typescript
// Cache product catalog
@Cacheable({ ttl: 3600 })
async getProducts() {
  return this.repo.find();
}

// Invalidate cache on update
@CacheEvict()
async updateProduct(id, data) {
  return this.repo.update(id, data);
}
```

### Query Optimization

```typescript
// Use eager loading to avoid N+1 queries
const items = await this.repo.find({
  relations: ['product', 'location'],
});

// Use query builder for complex queries
const items = await this.repo
  .createQueryBuilder('item')
  .leftJoinAndSelect('item.product', 'product')
  .where('item.qty_available < :threshold', { threshold: 10 })
  .getMany();
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs pos-kit-backend

# Verify database connection
psql -h localhost -U pos_user -d pos_kit -c "SELECT 1"

# Check port 3000 is available
lsof -i :3000
```

### Desktop client sync issues
```bash
# Check local SQLite database
sqlite3 ~/.pos-kit/local.db ".tables"

# View sync logs
tail -f ~/.pos-kit/logs/sync.log

# Clear local cache and resync
rm ~/.pos-kit/local.db && npm run tauri dev
```

### Payment processing fails
```bash
# Check Stripe API key
echo $STRIPE_API_KEY

# Test webhook
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d @test-webhook.json
```

### Inventory discrepancy
```bash
# Audit inventory movements
SELECT * FROM stock_movements 
WHERE product_id = 'xxx' 
ORDER BY created_at DESC 
LIMIT 100;

# Recalculate inventory state at timestamp
SELECT 
  product_id,
  SUM(CASE WHEN movement_type IN ('receive', 'adjust') THEN quantity ELSE -quantity END) as net_qty
FROM stock_movements
WHERE created_at <= '2024-01-15 10:30:00'
GROUP BY product_id;
```

---

## Resources

- **API Docs**: `http://localhost:3000/api/docs`
- **GraphQL Playground**: `http://localhost:3000/graphql`
- **Architecture**: See `ARCHITECTURE.md`
- **OpenAPI Schema**: See `openapi.yaml`
- **Postman Collection**: See `docs/postman-collection.json`
- **Device Integration**: See `docs/DEVICE_INTEGRATION.md`
- **Admin Manual**: See `docs/ADMIN_MANUAL.md`

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -am 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Create a Pull Request
5. Ensure CI/CD passes
6. Request review from maintainers
7. Merge after approval

---

## Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Contact the team at support@kits-pos.dev
- Check the FAQ in `docs/FAQ.md`
