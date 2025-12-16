# Windsurf AI Build Specification — Enterprise POS + Cloud Backend

## Project: KiTS Universal POS System

### Primary Objective
Build a secure, offline-capable desktop POS client (Windows/Linux) with a cloud backend providing multi-store, multi-warehouse inventory management, supplier workflows, advanced traceability, omnichannel integrations, analytics, RBAC, and an open API ecosystem.

---

## Technology Stack (Recommended)

- **Backend**: TypeScript/NestJS (Node.js) for API + business logic
- **Database**: PostgreSQL (primary), TimescaleDB for time-series analytics
- **Cache/Sessions**: Redis
- **Search/Analytics**: Elasticsearch or OpenSearch
- **Message Broker**: Kafka (event sourcing, high throughput)
- **Desktop Client**: Tauri (Rust + React + TypeScript) — low resource footprint
- **APIs**: GraphQL (primary) + REST endpoints; gRPC for internal microservices
- **Infrastructure**: Docker, Kubernetes (EKS/GKE/AKS), Terraform IaC
- **CI/CD**: GitHub Actions (lint → test → build → docker → deploy)
- **Auth**: OAuth2 (Keycloak/Auth0), JWT tokens, AWS KMS for secrets
- **Observability**: Prometheus + Grafana, ELK stack, Sentry for error tracking

---

## Repository Structure

```
pos-kit/
├── backend/
│   ├── src/
│   │   ├── auth/                 # OAuth2, JWT, RBAC
│   │   ├── products/             # SKU, variants, attributes
│   │   ├── inventory/            # Real-time stock, reservations
│   │   ├── warehouse/            # Multi-location, bins, transfers
│   │   ├── purchase-orders/      # PO creation, receiving, supplier mgmt
│   │   ├── sales/                # Checkout, refunds, returns
│   │   ├── stock-movements/      # Immutable ledger, event sourcing
│   │   ├── integrations/         # Payment, e-commerce, accounting adapters
│   │   ├── reporting/            # Dashboards, custom reports, BI export
│   │   ├── devices/              # Hardware registration, firmware, status
│   │   ├── sync/                 # Offline sync, conflict resolution
│   │   ├── webhooks/             # Event subscriptions
│   │   └── common/               # Shared utilities, middleware, guards
│   ├── test/                     # Unit + integration tests
│   ├── migrations/               # Database migrations (TypeORM)
│   ├── Dockerfile
│   ├── docker-compose.yml        # Local dev environment
│   ├── package.json
│   └── tsconfig.json
├── desktop-client/
│   ├── src/
│   │   ├── components/           # React UI (checkout, inventory, reports)
│   │   ├── pages/                # Main screens
│   │   ├── services/             # API client, local DB (SQLite), sync agent
│   │   ├── store/                # State management (Redux/Zustand)
│   │   ├── hardware/             # USB/HID/Serial device drivers
│   │   ├── offline/              # Local event log, conflict resolution
│   │   └── utils/
│   ├── src-tauri/                # Tauri Rust backend
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── workers/
│   ├── po-processor/             # Async PO ingestion, auto-reorder
│   ├── forecast-engine/          # Demand forecasting, replenishment suggestions
│   ├── reconciliation/           # Inventory reconciliation, cycle count processing
│   ├── notification-service/     # Email, SMS, push alerts
│   └── Dockerfile
├── integrations/
│   ├── stripe/                   # Payment gateway adapter
│   ├── shopify/                  # E-commerce sync
│   ├── quickbooks/               # Accounting export
│   ├── zebra-printer/            # Label printing
│   └── shippo/                   # Carrier integration
├── terraform/
│   ├── vpc.tf
│   ├── rds.tf                    # PostgreSQL managed DB
│   ├── redis.tf
│   ├── eks.tf                    # Kubernetes cluster
│   ├── variables.tf
│   └── outputs.tf
├── .github/workflows/
│   ├── backend-ci.yml
│   ├── desktop-ci.yml
│   └── deploy.yml
├── docs/
│   ├── API.md                    # OpenAPI/GraphQL schema reference
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── DEVICE_INTEGRATION.md
│   └── ADMIN_MANUAL.md
├── docker-compose.yml            # Full stack local dev
└── README.md
```

---

## Core Data Model (PostgreSQL Schema)

```sql
-- Multi-tenancy
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP
);

-- Locations (stores/warehouses)
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  type ENUM('store', 'warehouse'),
  address TEXT,
  created_at TIMESTAMP
);

-- Products & SKUs
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  sku VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  description TEXT,
  attributes JSONB,  -- color, size, etc.
  created_at TIMESTAMP
);

-- Inventory (real-time stock per location)
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  location_id UUID REFERENCES locations(id),
  qty_available INT,
  qty_reserved INT,
  qty_damaged INT,
  qty_in_transit INT,
  bin_id VARCHAR(255),
  uom VARCHAR(50),  -- unit of measure
  last_updated TIMESTAMP,
  UNIQUE(product_id, location_id)
);

-- Lot/Serial tracking
CREATE TABLE lots (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  lot_number VARCHAR(255),
  manufacture_date DATE,
  expiry_date DATE,
  quantity INT,
  created_at TIMESTAMP
);

-- Immutable stock movement ledger (event sourcing)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  product_id UUID REFERENCES products(id),
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  movement_type ENUM('sale', 'receive', 'adjust', 'transfer', 'return'),
  quantity INT,
  lot_id UUID REFERENCES lots(id),
  reason TEXT,
  user_id UUID,
  created_at TIMESTAMP,
  INDEX(tenant_id, created_at)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  po_number VARCHAR(255) UNIQUE,
  supplier_id UUID,
  expected_delivery_date DATE,
  status ENUM('draft', 'sent', 'acknowledged', 'partial', 'received', 'cancelled'),
  created_at TIMESTAMP
);

CREATE TABLE po_lines (
  id UUID PRIMARY KEY,
  po_id UUID REFERENCES purchase_orders(id),
  product_id UUID REFERENCES products(id),
  qty_ordered INT,
  qty_received INT,
  unit_cost DECIMAL(10,2)
);

-- Sales (transactions)
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  location_id UUID REFERENCES locations(id),
  user_id UUID,
  total_amount DECIMAL(10,2),
  payment_method ENUM('card', 'cash', 'split'),
  status ENUM('completed', 'refunded', 'partial_refund'),
  created_at TIMESTAMP
);

CREATE TABLE sale_lines (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  product_id UUID REFERENCES products(id),
  lot_id UUID REFERENCES lots(id),
  quantity INT,
  unit_price DECIMAL(10,2),
  discount DECIMAL(10,2)
);

-- Users & RBAC
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  permissions JSONB  -- array of permission strings
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY(user_id, role_id)
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  entity_type VARCHAR(255),
  entity_id UUID,
  action VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  created_at TIMESTAMP,
  INDEX(tenant_id, created_at)
);
```

---

## API Surface (GraphQL + REST)

### Authentication
```
POST /auth/login
POST /auth/refresh
POST /auth/sso
POST /auth/logout
```

### Products
```
GET /products?tenant_id=&location_id=&search=
POST /products
PUT /products/:id
DELETE /products/:id
GET /products/:id/variants
```

### Inventory
```
GET /inventory?location_id=&product_id=
POST /inventory/adjust
POST /inventory/transfer
GET /inventory/movements?location_id=&from_date=&to_date=
GET /inventory/low-stock
GET /inventory/valuation
```

### Purchase Orders
```
POST /purchase-orders
GET /purchase-orders?supplier_id=&status=
PUT /purchase-orders/:id
POST /purchase-orders/:id/receive
POST /purchase-orders/:id/cancel
GET /purchase-orders/:id/lines
```

### Sales
```
POST /sales (includes offline sync)
GET /sales?location_id=&from_date=&to_date=
POST /sales/:id/refund
POST /sales/:id/return
GET /sales/:id/lines
```

### Devices
```
POST /devices/register
GET /devices/:id/status
PUT /devices/:id/firmware
DELETE /devices/:id
```

### Webhooks
```
POST /webhooks/subscribe
GET /webhooks/subscriptions
DELETE /webhooks/subscriptions/:id
```

### Reporting
```
GET /reports/dashboard
GET /reports/inventory-health
GET /reports/sales-summary
POST /reports/custom
GET /reports/export?format=csv&type=sales
```

---

## Offline Sync & Conflict Resolution

1. **Desktop Client**: Maintains encrypted SQLite event log. All actions append to log and update local DB.
2. **Sync Agent**: Batches events, sends via authenticated TLS to cloud.
3. **Server**: Applies events idempotently (UUID + client_id + sequence). Returns server events.
4. **Conflict Policy**:
   - **Inventory**: Server-authoritative. Client proposes, server applies with optimistic locking.
   - **Metadata**: Last-writer-wins with version vectors; operator approval for critical changes (price/cost).
   - **Reservations**: FIFO queue; server returns accept/partial/deny on sync.

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci && npm run lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run test:unit && npm run test:integration

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.REGISTRY }}/pos-backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: kubectl set image deployment/pos-backend pos-backend=${{ secrets.REGISTRY }}/pos-backend:${{ github.sha }}
```

---

## Dockerfiles

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Desktop Client Dockerfile
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM ubuntu:22.04
RUN apt-get update && apt-get install -y libwebkit2gtk-4.0-dev
COPY --from=builder /app/src-tauri/target/release/pos-client /usr/local/bin/
ENTRYPOINT ["pos-client"]
```

---

## Integrations (Priority Order)

1. **Stripe/Adyen**: Payment tokenization (PCI DSS compliant)
2. **Shopify**: Bidirectional inventory & order sync
3. **QuickBooks Online**: Journal entry export (sales, COGS)
4. **Zebra/Epson**: Label & receipt printing
5. **Shippo/EasyPost**: Carrier APIs & label generation
6. **BigQuery/Snowflake**: BI data export

---

## Testing Strategy

- **Unit Tests**: 80% coverage on core services (inventory, sales, sync)
- **Integration Tests**: API + DB, multi-tenant isolation
- **E2E Tests**: Offline/online transitions, multi-terminal scenarios
- **Load Tests**: 1000 sales/min across 500 tenants
- **Security**: SAST/DAST scans, penetration test pre-GA

---

## MVP Scope (Phase 1)

- Desktop client: barcode checkout, offline queue, local device printing
- Cloud API: auth, product catalog, inventory sync, sales ingestion
- Basic PO creation & receiving
- Stripe integration + Shopify basic sync
- RBAC, audit logs, automated backups

---

## Phase 2 (Advanced)

- Multi-warehouse bin management, cycle counts
- Serial/lot tracking, advanced replenishment
- Accounting connectors (QuickBooks, Xero)
- Advanced analytics & BI
- Carrier integrations

---

## Acceptance Criteria

1. Single offline sale syncs within 60s of reconnection without data loss
2. Inventory adjustments have immutable audit entry, queryable in <2s
3. Low-stock alerts trigger auto-PO creation per threshold rules
4. Multi-terminal concurrent sales on same SKU handled via optimistic locking
5. 99.9% uptime SLA for cloud backend (monitored via Prometheus)

---

## Deliverables Expected

1. Full codebase (backend + desktop + workers) with tests & Dockerfiles
2. OpenAPI/GraphQL schema, DB migrations, seed data
3. CI/CD pipeline files, Terraform IaC for staging
4. Developer docs (API, onboarding, device integration guide)
5. Admin manual, QA report, load test results

---

## 6–9 Month Roadmap

- **Months 0–3**: Architecture, MVP backend + desktop, basic payments, Shopify sync
- **Months 3–6**: Warehouse features, PO automation, cycle counts, serial/lot tracking
- **Months 6–9**: Advanced analytics, carrier & accounting integrations, scaling, PCI audit

---

## Instructions for Windsurf AI

1. Generate modular microservices with clear separation of concerns
2. Provide containerized dev environment (docker-compose.yml)
3. Include Postman collection for all API endpoints
4. Seed demo tenant with sample products, locations, users
5. Parameterize all credentials/secrets via environment variables
6. Document expected cloud resources (RDS, Redis, EKS, etc.)
7. Ensure all code is TypeScript with strict mode enabled
8. Use NestJS decorators for RBAC guards and validation
9. Implement event sourcing for stock_movements table
10. Provide migration scripts for multi-tenant data isolation
