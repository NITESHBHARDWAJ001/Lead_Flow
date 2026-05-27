# Backend Guide

This folder contains the LeadFlow CRM API, Prisma schema, seed data, and automated tests.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- JWT authentication and role-based access control
- Zod validation, Winston logging, Swagger docs

## Local Setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
npm run dev
```

API base URL: `http://localhost:5000/api/v1`
Swagger docs: `http://localhost:5000/api-docs`

## Environment Variables

Set these values in `.env`:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SWAGGER_SERVER_URL`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

## Database Commands

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:prod
npm run prisma:seed
```



## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Seed Credentials

- Admin: `admin@leadflow.com` / `Admin@123`
- Employee: `john@leadflow.com` / `Employee@123`
- Employee: `jane@leadflow.com` / `Employee@123`
- Employee: `mike@leadflow.com` / `Employee@123`