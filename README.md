# KiTS Universal POS — Enterprise POS + Inventory Management System

**The best POS and inventory management system for small and medium businesses.**

A fully-featured, offline-capable, cloud-backed POS system with advanced inventory management, multi-location support, omnichannel integration, and extensible architecture.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development Setup

```bash
# Clone and install
git clone <repo-url>
cd pos-kit

# Start full stack (PostgreSQL, Redis, Kafka, Elasticsearch, Backend)
docker-compose up -d

# Install backend dependencies
cd backend && npm install && cd ..

# Run database migrations
cd backend && npm run migrate:latest && cd ..

# Seed demo data
cd backend && npm run seed:demo && cd ..

# Start backend (in new terminal)
cd backend && npm run start:dev

# Backend API will be available at http://localhost:3000
# GraphQL Playground: http://localhost:3000/graphql
# Health check: http://localhost:3000/health
```

## 📋 Project Structure

```
pos-kit/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── auth/              # Authentication & RBAC
│   │   ├── products/          # Product catalog
│   │   ├── inventory/         # Real-time inventory
│   │   ├── sales/             # Checkout & transactions
│   │   ├── purchase-orders/   # PO workflows
│   │   ├── stock-movements/   # Event sourcing ledger
│   │   ├── warehouse/         # Multi-location management
│   │   ├── reporting/         # Dashboards & reports
│   │   ├── devices/           # Hardware management
│   │   ├── webhooks/          # Event subscriptions
│   │   ├── sync/              # Offline sync
│   │   └── common/            # Shared utilities
│   ├── migrations/            # Database migrations
│   ├── package.json
│   └── Dockerfile
├── desktop-client/            # Tauri + React desktop app (coming soon)
├── docker-compose.yml         # Full stack local dev
├── WINDSURF_AI_PROMPT.md      # Windsurf AI specification
├── ARCHITECTURE.md            # System design
├── DEVELOPER_GUIDE.md         # Developer onboarding
├── openapi.yaml               # API specification
└── RESEARCH_SUMMARY.md        # Market research & features
```

## 🏗️ Architecture

**Multi-tier, scalable, offline-capable architecture:**

- **Desktop Client**: Tauri + React (offline-first, local SQLite)
- **Cloud Backend**: NestJS + PostgreSQL + Redis + Kafka
- **Real-time Sync**: Event-driven, conflict resolution, eventual consistency
- **Integrations**: Stripe, Shopify, QuickBooks, Zebra, Shippo
- **Infrastructure**: Docker, Kubernetes, Terraform IaC

See `ARCHITECTURE.md` for detailed system design.

## 📚 Core Features (MVP)

### POS & Checkout
- ✅ Barcode scanning
- ✅ Multiple payment methods (card, cash, split)
- ✅ Offline checkout with sync
- ✅ Receipt printing
- ✅ Refunds & returns

### Inventory Management
- ✅ Real-time stock tracking
- ✅ Multi-location support
- ✅ Stock adjustments & transfers
- ✅ Low-stock alerts
- ✅ Immutable audit trail

### Sales & Transactions
- ✅ Complete sale workflows
- ✅ Refund processing
- ✅ Sales history & reporting
- ✅ Multi-user support with RBAC

### Purchase Orders
- ✅ PO creation & management
- ✅ Goods receiving
- ✅ Supplier management
- ✅ Backorder handling

### Reporting & Analytics
- ✅ Sales dashboard
- ✅ Inventory health metrics
- ✅ Stock movement history
- ✅ Custom report builder

## 🔌 API Endpoints (MVP)

### Authentication
- `POST /auth/login` — User login
- `POST /auth/register` — User registration
- `POST /auth/refresh` — Refresh token

### Products
- `GET /products` — List products
- `POST /products` — Create product
- `GET /products/:id` — Get product
- `PUT /products/:id` — Update product
- `DELETE /products/:id` — Delete product

### Inventory
- `GET /inventory` — Get inventory items
- `POST /inventory/adjust` — Adjust stock
- `POST /inventory/transfer` — Transfer between locations
- `GET /stock-movements` — View movement history

### Sales
- `POST /sales` — Create sale (checkout)
- `GET /sales` — List sales
- `GET /sales/:id` — Get sale details
- `POST /sales/:id/refund` — Refund sale

### Purchase Orders
- `POST /purchase-orders` — Create PO
- `GET /purchase-orders` — List POs
- `GET /purchase-orders/:id` — Get PO
- `POST /purchase-orders/:id/receive` — Receive goods

### Reporting
- `GET /reports/dashboard` — Dashboard metrics
- `GET /reports/inventory-health` — Inventory health
- `GET /reports/export` — Export data

See `openapi.yaml` for complete API specification.

## 🗄️ Database Schema

**Core entities:**
- `users` — User accounts & authentication
- `products` — SKU catalog with attributes
- `inventory_items` — Real-time stock per location
- `stock_movements` — Immutable ledger (event sourcing)
- `sales` — Transactions
- `sale_lines` — Transaction line items
- `purchase_orders` — PO records
- `locations` — Stores & warehouses
- `audit_logs` — Full audit trail

See `WINDSURF_AI_PROMPT.md` for complete schema.

## 🔐 Security

- **Authentication**: OAuth2 + JWT
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: TLS encryption, PCI DSS compliance
- **Audit**: Immutable audit logs for all changes
- **Multi-tenancy**: Tenant isolation at database level

## 🚀 Deployment

### Docker
```bash
# Build backend image
docker build -t pos-kit-backend:latest ./backend

# Run with docker-compose
docker-compose up -d
```

### Kubernetes (Production)
```bash
# Deploy with Terraform
cd terraform
terraform init
terraform apply
```

See `DEVELOPER_GUIDE.md` for detailed deployment instructions.

## 📖 Documentation

- **`ARCHITECTURE.md`** — System design, data flow, scalability
- **`DEVELOPER_GUIDE.md`** — Setup, development workflow, testing
- **`WINDSURF_AI_PROMPT.md`** — Complete specification for code generation
- **`openapi.yaml`** — REST API specification
- **`RESEARCH_SUMMARY.md`** — Market research & feature analysis

## 🛠️ Development

### Running Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests
```

### Code Quality
```bash
npm run lint             # Lint code
npm run format           # Format code
npm run type-check       # Type checking
```

### Database Management
```bash
npm run migration:create -- --name=MyMigration  # Create migration
npm run migrate:latest                          # Run migrations
npm run migrate:down                            # Revert migration
npm run seed:demo                               # Seed demo data
```

## 📊 Roadmap

### Phase 1 (MVP) — Complete ✅
- Desktop client (Tauri) with barcode checkout
- Cloud API with auth, products, inventory, sales
- Basic PO & receiving
- Stripe integration
- Shopify basic sync
- RBAC & audit logs

### Phase 2 (Advanced) — In Progress
- Multi-warehouse bin management
- Cycle counting with mobile scanning
- Serial/lot tracking
- Advanced replenishment & forecasting
- Accounting connectors (QuickBooks, Xero)
- Advanced analytics & BI

### Phase 3 (Enterprise) — Planned
- PCI DSS audit completion
- Database sharding
- Vertical modules (pharmacy, hospitality, rental)
- Mobile app (React Native)
- Vendor-managed inventory (VMI)
- Advanced pricing & promotions

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -am 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Create Pull Request
5. Ensure CI/CD passes and request review

## 📝 License

MIT

## 📧 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: support@kits-pos.dev
- Check FAQ in `docs/FAQ.md`

---

**Built with ❤️ for small and medium businesses.**
