# KiTS Universal POS — System Architecture

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DESKTOP CLIENT (Tauri)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  React UI Layer                                                      │   │
│  │  ├─ Checkout Screen (barcode scanning, payment)                      │   │
│  │  ├─ Inventory Dashboard (stock levels, transfers, adjustments)       │   │
│  │  ├─ Purchase Orders (create, receive, supplier mgmt)                 │   │
│  │  ├─ Reports & Analytics (sales, inventory health, forecasts)         │   │
│  │  └─ Settings & Device Management                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Local Storage & Sync Layer                                          │   │
│  │  ├─ SQLite (encrypted) — local DB replica                            │   │
│  │  ├─ Event Log — immutable transaction queue                          │   │
│  │  ├─ Sync Agent — batches & sends events to cloud                     │   │
│  │  └─ Conflict Resolution Engine                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Hardware Interface Layer (Tauri Rust Backend)                       │   │
│  │  ├─ USB/HID/Serial Device Drivers                                    │   │
│  │  ├─ Barcode Scanner Integration                                      │   │
│  │  ├─ Receipt Printer (ESC/POS, Zebra ZPL)                             │   │
│  │  ├─ Payment Terminal (Stripe Terminal SDK)                           │   │
│  │  └─ Cash Drawer & Pole Display                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    TLS / Authenticated WebSocket
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUD BACKEND (NestJS)                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  API Gateway & Auth Layer                                            │   │
│  │  ├─ OAuth2 / JWT Token Management                                    │   │
│  │  ├─ RBAC Guards (role-based access control)                          │   │
│  │  ├─ Request Validation & Rate Limiting                               │   │
│  │  └─ Multi-tenant Isolation Middleware                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Core Business Logic Modules (NestJS Services)                       │   │
│  │  ├─ Products Service (SKU, variants, attributes)                     │   │
│  │  ├─ Inventory Service (real-time stock, reservations, transfers)     │   │
│  │  ├─ Sales Service (checkout, refunds, returns)                       │   │
│  │  ├─ Purchase Orders Service (PO creation, receiving, supplier mgmt)  │   │
│  │  ├─ Stock Movements Service (event sourcing ledger)                  │   │
│  │  ├─ Warehouse Service (multi-location, bins, cycle counts)           │   │
│  │  ├─ Reporting Service (dashboards, custom reports, BI export)        │   │
│  │  ├─ Devices Service (hardware registration, firmware, status)        │   │
│  │  ├─ Webhooks Service (event subscriptions, integrations)             │   │
│  │  └─ Sync Service (offline reconciliation, conflict resolution)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Integration Adapters (Plugin Architecture)                          │   │
│  │  ├─ Payment Gateways (Stripe, Adyen, Square)                         │   │
│  │  ├─ E-Commerce Sync (Shopify, WooCommerce, Magento)                  │   │
│  │  ├─ Accounting Export (QuickBooks, Xero, Odoo)                       │   │
│  │  ├─ Carrier APIs (Shippo, EasyPost, FedEx, UPS)                      │   │
│  │  └─ Label Printing (Zebra, Epson)                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  GraphQL + REST API Endpoints                                        │   │
│  │  ├─ /auth/* (login, refresh, logout, SSO)                            │   │
│  │  ├─ /products/* (CRUD, variants, search)                             │   │
│  │  ├─ /inventory/* (stock, adjustments, transfers, movements)          │   │
│  │  ├─ /purchase-orders/* (create, receive, supplier mgmt)              │   │
│  │  ├─ /sales/* (checkout, refunds, returns)                            │   │
│  │  ├─ /devices/* (register, status, firmware)                          │   │
│  │  ├─ /reports/* (dashboard, health, export)                           │   │
│  │  └─ /webhooks/* (subscriptions, event delivery)                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   PostgreSQL     │      │     Redis        │      │     Kafka        │
│   (Primary DB)   │      │  (Cache/Sessions)│      │  (Event Stream)  │
│                  │      │                  │      │                  │
│ ├─ Tenants       │      │ ├─ Session Store │      │ ├─ Stock Events  │
│ ├─ Locations     │      │ ├─ Locks         │      │ ├─ Sale Events   │
│ ├─ Products      │      │ ├─ Rate Limits   │      │ ├─ PO Events     │
│ ├─ Inventory     │      │ └─ Pub/Sub       │      │ └─ Integration   │
│ ├─ Stock Ledger  │      │                  │      │    Events        │
│ ├─ Sales         │      │                  │      │                  │
│ ├─ POs           │      │                  │      │                  │
│ ├─ Users/RBAC    │      │                  │      │                  │
│ └─ Audit Logs    │      │                  │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Elasticsearch   │      │  Worker Fleet    │      │   Observability  │
│  (Search/Logs)   │      │  (Async Jobs)    │      │                  │
│                  │      │                  │      │ ├─ Prometheus    │
│ ├─ Product Index │      │ ├─ PO Processor  │      │ ├─ Grafana       │
│ ├─ Log Index     │      │ ├─ Forecasting   │      │ ├─ ELK Stack     │
│ └─ Analytics     │      │ ├─ Reconciliation│      │ └─ Sentry        │
│                  │      │ ├─ Notifications │      │                  │
│                  │      │ └─ BI Export     │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## Component Descriptions

### Desktop Client (Tauri)

**Purpose**: Offline-capable POS terminal with local sync.

**Key Features**:
- React UI for checkout, inventory, reports
- Encrypted SQLite local database (mirrors cloud schema)
- Event log for all user actions (immutable append-only)
- Sync agent batches events and sends to cloud via WebSocket/TLS
- Conflict resolution engine (server-authoritative for inventory)
- Hardware drivers for barcode scanners, printers, payment terminals
- Works offline; queues transactions and syncs when reconnected

**Technology**: Tauri (Rust + WebView), React, TypeScript, SQLite, Redux/Zustand

---

### Cloud Backend (NestJS)

**Purpose**: Multi-tenant API, business logic, integrations, reporting.

**Core Modules**:
- **Auth**: OAuth2, JWT, RBAC, multi-tenant isolation
- **Products**: SKU management, variants, attributes, search
- **Inventory**: Real-time stock, reservations, transfers, multi-location
- **Sales**: Checkout, refunds, returns, payment processing
- **Purchase Orders**: PO creation, receiving, supplier management
- **Stock Movements**: Immutable ledger (event sourcing)
- **Warehouse**: Multi-location, bin management, cycle counts
- **Reporting**: Dashboards, custom reports, BI export
- **Devices**: Hardware registration, firmware, status monitoring
- **Sync**: Offline reconciliation, conflict resolution
- **Webhooks**: Event subscriptions for integrations

**Technology**: NestJS, TypeScript, PostgreSQL, Redis, Kafka, GraphQL + REST

---

### Data Layer

**PostgreSQL** (primary relational store):
- Tenant isolation via tenant_id foreign key
- Stock movements stored as immutable event log (event sourcing)
- Audit logs for all changes
- Supports point-in-time recovery for inventory validation

**Redis** (caching & sessions):
- Session store for JWT tokens
- Distributed locks for concurrent inventory operations
- Rate limiting buckets
- Pub/Sub for real-time notifications

**Kafka** (event streaming):
- Stock movement events (sale, receive, adjust, transfer)
- Integration events (payment, e-commerce sync)
- Worker job queues
- Supports event sourcing and audit trail

**Elasticsearch** (search & analytics):
- Product search index
- Log aggregation
- Custom analytics queries

---

### Worker Fleet (Kubernetes)

**Purpose**: Async processing, background jobs, integrations.

**Workers**:
- **PO Processor**: Ingest POs, validate, auto-create reorder POs
- **Forecast Engine**: Demand forecasting, replenishment suggestions
- **Reconciliation**: Inventory reconciliation, cycle count processing
- **Notification Service**: Email, SMS, push alerts (low stock, delays)
- **BI Export**: Scheduled data dumps to S3, BigQuery, Snowflake

**Technology**: Node.js workers, Kafka consumers, scheduled jobs (Bull/Agenda)

---

### Integration Adapters

**Payment Gateways**:
- Stripe (card, contactless, tokenization)
- Adyen (omnichannel payments)
- Local gateways (Square, PayPal)

**E-Commerce**:
- Shopify (bidirectional inventory & order sync)
- WooCommerce (inventory sync)
- Magento (catalog & stock sync)

**Accounting**:
- QuickBooks Online (journal entry export)
- Xero (sales & COGS posting)
- Odoo (ERP integration)

**Carriers**:
- Shippo (label generation, tracking)
- EasyPost (multi-carrier shipping)
- FedEx/UPS/DHL (direct APIs)

**Printing**:
- Zebra (ZPL label printers)
- Epson (receipt printers)

---

## Data Flow Scenarios

### Scenario 1: Offline Sale → Cloud Sync

1. **Desktop Client** (offline):
   - Barcode scanned, item added to cart
   - Payment processed locally (or queued if offline)
   - Sale recorded in local SQLite + event log
   - Inventory qty_available decremented locally

2. **Sync Agent** (when online):
   - Batches sale event + inventory adjustment
   - Sends to cloud via authenticated WebSocket
   - Includes idempotent event ID (client_id + sequence)

3. **Cloud Backend**:
   - Receives event, checks idempotency (prevents double-processing)
   - Applies sale to inventory (server-authoritative)
   - If conflict (qty insufficient), returns DENY + reason
   - Client resolves (swap item, void, partial)
   - Stores in PostgreSQL, emits to Kafka
   - Returns acknowledgment + server events to client

4. **Workers**:
   - Kafka consumer processes sale event
   - Updates Elasticsearch index
   - Triggers low-stock alert if threshold breached
   - Exports to BI system

---

### Scenario 2: Multi-Terminal Concurrent Sale

1. **Terminal A & B** (same location, same SKU):
   - Both scan item with qty=1 available
   - Both attempt sale locally (offline or online)

2. **Cloud Backend** (optimistic locking):
   - Terminal A's sale arrives first → qty decremented to 0, version=1
   - Terminal B's sale arrives → version check fails (expected version=0, actual=1)
   - Returns CONFLICT to Terminal B

3. **Terminal B** (conflict resolution):
   - Receives DENY, notifies cashier
   - Cashier swaps item or voids transaction
   - Sync agent retries with updated event

---

### Scenario 3: Purchase Order Receive

1. **Desktop Client**:
   - Scan PO barcode, open receive screen
   - Scan items, enter quantities received
   - Optionally capture lot/serial numbers
   - Submit receive event

2. **Cloud Backend**:
   - Validates PO exists, lines match
   - Updates inventory (qty_available += qty_received)
   - Records stock movement event
   - Updates PO status (partial/received)
   - Emits Kafka event

3. **Workers**:
   - Forecast engine recalculates reorder points
   - Auto-creates new PO if min threshold breached
   - Notifies supplier of receipt (webhook)

---

## Offline Sync Algorithm

**Write-Ahead Log (WAL) Pattern**:

1. **Client Action** → Append to local event log + update SQLite
2. **Sync Agent** (background):
   - Reads unsync'd events from log
   - Batches into sync request (max 1000 events per batch)
   - Sends with idempotent event IDs: `{client_id}#{sequence}#{uuid}`
3. **Server**:
   - Checks idempotency cache (Redis) for event ID
   - If seen, return cached response (idempotent)
   - If new, apply event, cache response
4. **Client**:
   - Receives response, marks events as synced
   - Deletes from local event log (or archives)
   - Applies server events (e.g., updated prices, new products)

**Conflict Resolution**:
- **Inventory**: Server-authoritative. Client proposes, server applies with optimistic locking.
- **Metadata**: Last-writer-wins with version vectors. Operator approval for critical changes.
- **Reservations**: FIFO queue. Server returns accept/partial/deny.

---

## Security & Compliance

**Authentication & Authorization**:
- OAuth2 (Keycloak/Auth0) for SSO
- JWT tokens (short-lived access, long-lived refresh)
- RBAC guards on all endpoints (per-module, per-location)
- Multi-tenant isolation via tenant_id middleware

**Data Protection**:
- TLS 1.3 for all network traffic
- Encrypted SQLite on desktop (SQLCipher)
- Secrets vault (AWS KMS or HashiCorp Vault)
- PII encryption at rest (AES-256)
- PCI DSS compliance for payment data (tokenization, no storage)

**Audit & Compliance**:
- Immutable audit log (who/what/when for all changes)
- Event sourcing for stock movements (recreate state at any timestamp)
- Data export for accounting (journal entries, COGS)
- Regulatory compliance modules (lot expiry, tax rules, food safety)

---

## Deployment & Infrastructure

**Local Development**:
```bash
docker-compose up  # Spins up PostgreSQL, Redis, Kafka, Elasticsearch, backend, desktop client
```

**Staging/Production**:
- **Compute**: Kubernetes (EKS/GKE/AKS)
- **Database**: RDS PostgreSQL (managed, multi-AZ)
- **Cache**: ElastiCache Redis
- **Message Broker**: MSK (Managed Streaming for Kafka)
- **Search**: Amazon OpenSearch or self-hosted Elasticsearch
- **Storage**: S3 (backups, BI exports)
- **DNS/CDN**: CloudFront + Route53
- **Monitoring**: Prometheus, Grafana, ELK, Sentry

**IaC**: Terraform modules for all infrastructure

---

## Scalability & Performance

**Capacity Planning** (Phase 1):
- 500 concurrent stores (tenants)
- 10 terminals per store
- 1000 sales/min peak load
- Sub-2s API latency for inventory queries

**Scaling Strategies**:
- **Database**: Read replicas for reporting, connection pooling (PgBouncer)
- **Cache**: Redis cluster for distributed locks
- **Message Queue**: Kafka partitioning by tenant
- **Search**: Elasticsearch sharding by tenant
- **Compute**: Horizontal pod autoscaling (HPA) on K8s
- **Future**: Database sharding by tenant when scale > 10k tenants

---

## Monitoring & Observability

**Metrics** (Prometheus):
- API latency (p50, p95, p99)
- Sync success/failure rates
- Inventory conflict rates
- Queue lengths (Kafka, job queues)
- DB replication lag

**Logs** (ELK Stack):
- Centralized logging with request ID correlation
- Error tracking (Sentry)
- Audit log queries

**Alerts**:
- Stuck sync jobs (>5 min)
- High conflict rates (>5%)
- DB replication lag (>10s)
- API error rate (>1%)
- Low disk space, memory pressure

---

## Development Workflow

1. **Feature Branch**: Developer creates feature branch
2. **Local Dev**: `docker-compose up`, code in IDE
3. **Tests**: Unit + integration tests (80% coverage target)
4. **Push**: GitHub Actions runs lint, test, build
5. **Docker Build**: Builds image, pushes to registry
6. **Deploy to Staging**: Canary deployment, health checks
7. **QA**: Manual testing, load tests
8. **Merge to Main**: Triggers production deployment
9. **Canary Release**: 10% → 50% → 100% rollout with monitoring

---

## Future Enhancements

- **AI/ML**: Demand forecasting, anomaly detection, price optimization
- **Mobile**: React Native app for inventory staff
- **Advanced Analytics**: Cohort analysis, LTV, basket analysis
- **Vertical Modules**: Pharmacy (controlled substances), Hospitality (recipes), Rental (asset tracking)
- **Blockchain**: Supply chain traceability (optional)
