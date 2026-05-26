# NBDA Platform

Naldanga Blood Donors Association (NBDA) platform — monorepo with Next.js frontend and Express/GraphQL backend.

## Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js (App Router), Apollo Client, Socket.io Client |
| Backend | Express, Apollo Server, MongoDB, Redis, Socket.io |
| Tooling | npm workspaces, TypeScript |

## Prerequisites

- Node.js 20+
- MongoDB (local, Docker, or Atlas)
- Redis (local, Docker, or cloud)
- Docker Desktop (optional, easiest for local MongoDB + Redis)

## Start MongoDB & Redis (required for backend)

The backend **will not start** until MongoDB and Redis are reachable. If you see:

```text
MongooseServerSelectionError: connect ECONNREFUSED ... 27017
```

MongoDB is not running. Use one of these options:

**Option A — Docker (recommended)**

```bash
npm run docker:up
```

**Option B — Install MongoDB & Redis locally** and ensure services are running on ports `27017` and `6379`.

**Option C — MongoDB Atlas + cloud Redis** — set `MONGODB_URI` and `REDIS_URL` in `backend/.env`.

## Setup

```bash
# Install all dependencies (root + workspaces)
npm install

# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Edit `frontend/.env.local` and `backend/.env` with your connection strings and secrets.

## Development

```bash
# 1. Start databases (if using Docker)
npm run docker:up

# 2. Run frontend (port 3000) and backend (port 4000) together
npm run dev

# Or run individually
npm run dev:frontend
npm run dev:backend
```

- Frontend: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
- Health: http://localhost:4000/health

## Week 1 & Week 2 Backend Testing (Auth)

### REST API (Express)
Base URL: `http://localhost:4000`

#### 1) `POST /auth/register`
```json
{
  "name": "Test User",
  "phone": "01700000000",
  "bloodGroup": "A+",
  "division": "Dhaka",
  "district": "Dhaka",
  "upazila": "Mirpur",
  "village": "Test Village",
  "role": "User"
}
```

#### 2) `POST /auth/verify-otp-and-register`
Use the OTP code shown in the backend terminal:
```json
{
  "phone": "01700000000",
  "code": "<OTP_CODE_FROM_TERMINAL>",
  "password": "StrongPassw0rd!"
}
```

#### 3) `POST /auth/login`
```json
{
  "phone": "01700000000",
  "password": "StrongPassw0rd!"
}
```

### GraphQL (Apollo Sandbox / GraphQL Playground)
GraphQL endpoint: `http://localhost:4000/graphql`

#### 1) `register`
```graphql
mutation Register {
  register(
    input: {
      name: "Test User"
      phone: "01700000000"
      bloodGroup: "A+"
      division: "Dhaka"
      district: "Dhaka"
      upazila: "Mirpur"
      village: "Test Village"
      role: User
    }
  ) {
    success
    message
    expiresAt
  }
}
```

#### 2) `verifyOtpAndRegister`
```graphql
mutation VerifyOtpAndRegister {
  verifyOtpAndRegister(
    input: {
      phone: "01700000000"
      code: "<OTP_CODE_FROM_TERMINAL>"
      password: "StrongPassw0rd!"
    }
  ) {
    success
    message
    accessToken
    user {
      id
      uniqueId
      name
      phone
      role
      isAvailable
      lastDonatedAt
      points
      impactMetrics
      createdAt
      updatedAt
    }
  }
}
```

#### 3) `login`
```graphql
mutation Login {
  login(
    input: {
      phone: "01700000000"
      password: "StrongPassw0rd!"
    }
  ) {
    success
    message
    accessToken
    user {
      id
      uniqueId
      name
      phone
      role
      isAvailable
      lastDonatedAt
      points
      impactMetrics
      createdAt
      updatedAt
    }
  }
}
```

### Where the OTP Shows Up (Mock SMS)
During `register`, the OTP is logged by the backend mock SMS gateway to the Node/Cursor terminal running the `backend` service.
Look for lines starting with: `[sms:mock] Code:`

## Project structure

```
NBDA-Platform/
├── frontend/     # Next.js App Router
└── backend/      # Express + Apollo + Socket.io
```

## Build

```bash
npm run build
```
