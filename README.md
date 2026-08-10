# StockPilot — MERN Inventory Management System

A full-stack inventory management application with JWT authentication, RBAC, product/category CRUD, stock adjustments, dashboard analytics, and stock history.

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, Redux Toolkit, TanStack Query, Tailwind CSS v4, shadcn-style UI, Zod, React Hook Form, Axios, React Router |
| Backend | Node.js, Express, Mongoose, Zod, JWT, bcrypt, Helmet, Swagger |
| Database | MongoDB |

## Features

- User registration, login, logout (JWT access + refresh tokens)
- Role-based access control (`admin`, `staff`)
- Dashboard stats: total products, categories, stock quantity, low/out of stock
- Product CRUD with search, category/status filters, sort, pagination
- Automatic stock status: In Stock / Low Stock / Out of Stock
- Category CRUD (delete restricted to admin; blocked if products assigned)
- Stock increase/decrease with negative-inventory prevention and history
- Swagger/OpenAPI docs at `/api/docs`

## Project Structure

```
inventory/
├── client/          # React SPA
├── server/          # Express API
├── docs/            # ER diagram and docs
└── README.md
```

## Prerequisites

- Node.js 20+
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd inventory
npm install --prefix server
npm install --prefix client
```

### 2. Environment variables

Copy the examples and adjust as needed:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server (`server/.env`)**

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_ACCESS_EXPIRES_IN` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | e.g. `7d` |
| `CLIENT_URL` | Frontend origin for CORS |
| `LOW_STOCK_THRESHOLD` | Quantity at/below = Low Stock (default `10`) |

**Client (`client/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` |

### 3. Seed demo data

```bash
npm run seed --prefix server
```

Demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@inventory.local` | `Admin123!` |
| Staff | `staff@inventory.local` | `Staff123!` |

### 4. Run the app

Terminal 1 — API:

```bash
npm run dev --prefix server
```

Terminal 2 — UI:

```bash
npm run dev --prefix client
```

- App: http://localhost:5173
- API: http://localhost:5000/api
- Swagger UI: http://localhost:5000/api/docs
- OpenAPI JSON: http://localhost:5000/api/docs.json

## RBAC

| Action | Admin | Staff |
|--------|-------|-------|
| Products CRUD | Yes | Yes |
| Stock adjust / history | Yes | Yes |
| Categories create/edit | Yes | Yes |
| Categories delete | Yes | No |
| Dashboard | Yes | Yes |

The first user to register (when the database has no users) is assigned `admin`; subsequent registrations are `staff`.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/categories` | List / create |
| PUT/DELETE | `/api/categories/:id` | Update / delete |
| GET/POST | `/api/products` | List / create |
| GET/PUT/DELETE | `/api/products/:id` | Read / update / delete |
| POST | `/api/inventory/:productId/increase` | Increase stock |
| POST | `/api/inventory/:productId/decrease` | Decrease stock |
| GET | `/api/inventory/:productId/history` | Stock history |
| GET | `/api/dashboard/stats` | Dashboard stats |

Full interactive docs: [Swagger UI](http://localhost:5000/api/docs)

## Database Schema

See [docs/er-diagram.md](docs/er-diagram.md).

Product `status` is computed:

- `quantity === 0` → Out of Stock
- `0 < quantity <= LOW_STOCK_THRESHOLD` → Low Stock
- otherwise → In Stock

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev --prefix server` | Start API with nodemon |
| `npm run seed --prefix server` | Seed demo users/products |
| `npm run start --prefix server` | Start API in production mode |
| `npm run dev --prefix client` | Start Vite dev server |
| `npm run build --prefix client` | Build frontend |

## License

MIT
