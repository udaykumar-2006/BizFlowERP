# Mini ERP + CRM Operations Portal

A simple full-stack ERP/CRM operations portal for managing customers,
products, inventory, stock movements, and sales challans.

## Features

-   JWT authentication
-   Role-based access control
-   Customer CRM and follow-ups
-   Product management
-   Inventory and stock movements
-   Sales challans
-   Stock validation and transaction-safe confirmation
-   Product snapshots in challans
-   Minimal responsive frontend

## Tech Stack

**Backend:** Node.js, JavaScript, Express.js, Prisma, PostgreSQL, JWT,
bcrypt, Zod

**Frontend:** React, Vite, JavaScript, Axios, React Router

**Deployment:** Vercel (frontend), Render (backend), Neon PostgreSQL
(database)

## Project Structure

``` text
project/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       ├── validators/
│       ├── utils/
│       ├── prisma/
│       ├── app.js
│       └── server.js
├── client/
│   └── src/
└── README.md
```

## Prerequisites

-   Node.js
-   npm
-   PostgreSQL or a PostgreSQL provider
-   Git

## Local Setup

### 1. Clone

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

### 2. Backend

``` bash
cd backend
npm install
```

Create `backend/.env`:

``` env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="1d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Do not commit `.env`.

### 3. Database

From `backend/`:

``` bash
npx prisma generate
npx prisma migrate dev
```

If a seed script is configured:

``` bash
npx prisma db seed
```

### 4. Start Backend

``` bash
npm run dev
```

Default:

``` text
http://localhost:5000
```

### 5. Frontend

Open another terminal:

``` bash
cd client
npm install
```

Create `client/.env`:

``` env
VITE_API_URL="http://localhost:5000/api"
```

Start:

``` bash
npm run dev
```

Default:

``` text
http://localhost:5173
```

## Main Workflow

``` text
Login
  ↓
Customer
  ↓
Product
  ↓
Stock IN
  ↓
Create Draft Challan
  ↓
Confirm Challan
  ↓
Stock OUT
  ↓
Stock Movement Audit
```

Important rules:

-   Draft challans do not reduce stock.
-   Confirmed challans reduce stock.
-   Stock cannot become negative.
-   Challan confirmation is transactional.
-   A confirmed challan cannot be confirmed again.
-   Product snapshot data is stored in challan items.

## API

Base URL:

``` text
/api
```

### Auth

``` text
POST /auth/login
```

### Customers

``` text
GET    /customers
POST   /customers
GET    /customers/:id
PATCH  /customers/:id
GET    /customers/:id/followups
POST   /customers/:id/followups
```

### Products

``` text
GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
```

### Inventory

``` text
GET  /stock-movements
POST /stock-movements
GET  /products/:id/stock-movements
```

### Challans

``` text
GET    /challans
POST   /challans
GET    /challans/:id
PATCH  /challans/:id
POST   /challans/:id/confirm
POST   /challans/:id/cancel
```

## API Testing

Recommended Postman flow:

``` text
1. Login
2. Create customer
3. Create product
4. Add stock
5. Verify stock
6. Create draft challan
7. Verify stock is unchanged
8. Confirm challan
9. Verify stock decreased
10. Verify OUT stock movement
```

Also test invalid login, invalid JWT, wrong roles, duplicate SKU,
insufficient stock, double confirmation, cancelled challan confirmation,
and multi-product challans.

## Environment Variables

### Backend

``` env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=
NODE_ENV=
FRONTEND_URL=
```

### Frontend

``` env
VITE_API_URL=
```

Never commit real secrets. Commit `.env.example` instead.

## Security

-   Passwords are hashed with bcrypt.
-   JWT secrets come from environment variables.
-   Password hashes are never returned by APIs.
-   Backend middleware enforces authentication and roles.
-   Frontend role checks are only for UI visibility.
-   Stock validation happens on the backend.
-   Critical stock operations use database transactions.

## Test Credentials

Seeded development accounts:

``` text
Admin      admin@example.com
Sales      sales@example.com
Warehouse  warehouse@example.com
Accounts   accounts@example.com
```

Password:

``` text
<SEE_SEED_SCRIPT_OR_SET_YOUR_DEVELOPMENT_PASSWORD>
```

Do not use development credentials in production.

## Architecture

``` text
React Client
     │
     │ REST API
     ▼
Express Backend
     │
     ├── Routes
     ├── Middleware
     ├── Controllers
     └── Services
             │
             ▼
           Prisma
             │
             ▼
         PostgreSQL
```

Request flow:

``` text
Route → Middleware → Controller → Service → Prisma → PostgreSQL
```

## Known Limitations

Intentionally outside the current scope:

-   Purchase orders
-   Full accounting/invoicing
-   Payment processing
-   GST accounting engine
-   Advanced reporting
-   Multi-company support
-   Complex approval workflows
-   Real-time notifications
-   PDF invoice export
-   S3 product images
-   Docker
-   GitHub Actions

## Final Submission

-   GitHub repository URL
-   Live frontend URL
-   Live backend API URL
-   Test credentials for all roles
-   Postman collection or API documentation
-   README
-   Architecture explanation
-   Known limitations


