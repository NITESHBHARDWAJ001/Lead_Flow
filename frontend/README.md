# Frontend Guide

This folder contains the LeadFlow CRM React app built with Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, and reusable UI components.

## Stack

- React 18 + Vite + TypeScript
- React Router v6
- TanStack Query
- Tailwind CSS + Radix UI + Lucide icons
- Axios-based API layer

## Local Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Local app URL: `http://localhost:3000`

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL for local development and deployment

Example:

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Routing

The app uses browser routing, so deployed hosts must rewrite all non-asset routes to `index.html`. This repo includes `frontend/vercel.json` for Vercel SPA fallback.

## Build and Preview

```bash
npm run build
npm run preview
```

## Deployment Notes

- Set `VITE_API_BASE_URL` to the deployed backend URL.
- Keep the frontend and backend origins aligned with the backend CORS setting.
- If you deploy to Vercel, the rewrite file in this folder handles refreshes on nested routes.