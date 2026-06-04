# Krishna Multi-Branch E-Commerce Platform

Production-ready Next.js 16 full-stack e-commerce platform with role-based access control, branch management, product management, Google OAuth customers, and Socket.IO chat support.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- MongoDB + Mongoose
- NextAuth (Credentials + Google OAuth)
- Cloudinary (secure image uploads)
- Socket.IO (real-time chat)

## Features

- **Super Admin**
  - Branch CRUD and branch head approvals
  - Global product visibility
  - Dashboard statistics
- **Branch Head**
  - Registration with pending approval
  - Branch-scoped product management
  - Customer chat support
- **Customer**
  - Google OAuth sign-in
  - Product discovery with search/filter/sort
  - Product detail and branch info
  - Chat and order history

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

See `.env.example` for all required values.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`

## API Overview

- `POST /api/auth/register-branch-head`
- `GET/POST /api/branches`
- `PATCH/DELETE /api/branches/:id`
- `GET /api/branch-heads/pending`
- `PATCH /api/branch-heads/:id/approval`
- `GET/POST /api/products`
- `GET/PATCH/DELETE /api/products/:id`
- `GET /api/dashboard/stats`
- `GET/POST /api/chats`
- `POST/PATCH /api/chats/:id/messages`
- `GET/POST /api/orders`
- `POST /api/uploads`

## Security

- bcrypt password hashing
- JWT session strategy via NextAuth
- Role-based authorization checks on API routes
- Validation and sanitization via Zod and Mongoose schema constraints
- File upload type and size checks
