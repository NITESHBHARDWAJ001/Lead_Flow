# LeadFlow CRM

A modern, production-ready Lead Management CRM system built with a clean full-stack TypeScript architecture. Designed to demonstrate SaaS-grade engineering practices.

---

## Features

### Admin
- Full lead visibility across the entire team
- Create, update, reassign, and delete any lead
- Manage employees (create, activate/deactivate)
- Admin dashboard with charts, KPIs, and team performance table

### Employee
- View and manage only assigned leads
- Create leads (auto-assigned to self)
- Update lead status with full history tracking
- Personal dashboard with conversion metrics

### Core
- JWT authentication with auto logout on token expiry
- Role-based access control (ADMIN / EMPLOYEE)
- Full CRUD with search, filter, sort, and pagination
- Lead status history with audit trail
- Real-time toast notifications
- Responsive mobile-first design

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT, bcryptjs |
| **Validation** | Zod |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Winston |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Testing** | Jest, Supertest |
| **Frontend** | React 18, Vite, TypeScript |
| **UI** | Tailwind CSS, Shadcn UI, Lucide Icons |
| **State** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **HTTP** | Axios (centralized instance) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## Architecture

```
leadflow-crm/
├── backend/
│   ├── src/
│   │   ├── config/          # env validation
│   │   ├── lib/             # prisma client, logger
│   │   ├── middlewares/     # auth, RBAC, validation, error handler
│   │   ├── utils/           # errors, response helpers, pagination
│   │   ├── types/           # global TypeScript types
│   │   ├── docs/            # Swagger spec
│   │   └── modules/
│   │       ├── auth/        # login, JWT
│   │       ├── users/       # employee management
│   │       ├── leads/       # lead CRUD + history
│   │       └── dashboard/   # analytics
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── tests/
│       ├── unit/
│       └── integration/
│
└── frontend/
    └── src/
        ├── api/             # axios instance + endpoints
        ├── services/        # typed API service layer
        ├── hooks/
        │   ├── queries/     # TanStack Query hooks
        │   └── mutations/   # mutation hooks with cache invalidation
        ├── app/
        │   ├── providers/   # QueryProvider, AuthProvider
        │   └── router/      # route config, ProtectedRoute
        ├── features/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── leads/
        │   └── users/
        ├── pages/           # route-level pages
        ├── layouts/         # AppLayout, AuthLayout
        └── components/
            ├── ui/          # Shadcn component library
            └── common/      # shared app components
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone the repository

```bash
git clone <repo-url>
cd leadflow-crm
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
npm run dev
```

Backend runs at: `http://localhost:5000`  
Swagger docs at: `http://localhost:5000/api-docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret (≥16 chars) | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `RATE_LIMIT_MAX` | Requests per window | `100` |

---

## Docker Setup

The easiest way to run the full stack:

```bash
# Copy and configure secrets
cp .env.example .env
# Edit .env with strong values

# Build and start all services
docker compose up --build

# Seed the database (first run)
docker compose exec backend npx ts-node prisma/seed.ts
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000/api/v1 |
| Swagger Docs | http://localhost:5000/api-docs |
| PostgreSQL | localhost:5432 |

```bash
# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## API Reference

Base URL: `/api/v1`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/me` | Get current user |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create employee |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List leads (RBAC filtered) |
| POST | `/leads` | Create lead |
| GET | `/leads/:id` | Get lead with history |
| PATCH | `/leads/:id` | Update lead |
| DELETE | `/leads/:id` | Delete lead (Admin only) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/admin` | Admin analytics (Admin only) |
| GET | `/dashboard/employee` | Personal stats |

### Query Parameters (Leads)
`?search=` `&status=INTERESTED|NOT_INTERESTED|CONVERTED` `&source=CALL|WHATSAPP|FIELD` `&employeeId=` `&page=1` `&limit=10` `&sortBy=createdAt` `&sortOrder=asc|desc`

---

## Running Tests

```bash
cd backend

# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Test Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@leadflow.com | Admin@123 |
| Employee | john@leadflow.com | Employee@123 |
| Employee | jane@leadflow.com | Employee@123 |
| Employee | mike@leadflow.com | Employee@123 |

---

## Database Schema

```
users          → id, name, email, password (hashed), role, isActive, timestamps
leads          → id, name, phone, email, source, status, notes, createdById, assignedToId, timestamps
lead_status_history → id, leadId, oldStatus, newStatus, changedById, createdAt
```

---

## Key Design Decisions

- **Thin controllers**: All business logic lives in services, controllers only orchestrate
- **Zod at boundaries**: Validation runs at the HTTP boundary, types are derived from schemas
- **RBAC middleware**: `authorize(...roles)` middleware keeps route files clean
- **Generic API layer**: One Axios instance with interceptors; no direct Axios calls in services
- **React Query**: Cache invalidation on every mutation keeps UI consistent without manual refetches
- **Status history**: Immutable audit trail on every lead status change
- **Prisma transactions**: Multi-step DB operations wrapped in `$transaction` for consistency

---

## License

MIT
