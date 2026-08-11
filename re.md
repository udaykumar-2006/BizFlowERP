# Mini ERP + CRM — Minimal Effort Build Plan

## Goal

Build only what the assignment needs, in the order we normally learn:

**DB → Backend Setup → Models → Routes → Controllers → Services → Middleware → Test APIs → Frontend → Deploy → README**

The frontend should be extremely simple: **black + white, one font, simple forms/tables, no fancy UI.**

---

# 1. Project Setup

### Backend

Use:

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod

### Frontend

Use:

- React
- Vite
- TypeScript
- Axios
- React Router

**Do not add:** Tailwind, TanStack Query, React Hook Form, Swagger unless everything else is already finished.

### Folder structure

```text
project/
├── backend/
└── frontend/
```

---

# 2. Design the Database First

Keep only these tables:

```text
User
Customer
CustomerFollowUp
Product
StockMovement
Challan
ChallanItem
```

## User

```text
id
name
email
passwordHash
role
createdAt
updatedAt
```

Roles:

```text
ADMIN
SALES
WAREHOUSE
ACCOUNTS
```

## Customer

```text
id
name
mobile
email
businessName
gstNumber
customerType
address
status
followUpDate
notes
createdAt
updatedAt
```

## CustomerFollowUp

```text
id
customerId
note
followUpDate
createdBy
createdAt
```

## Product

```text
id
name
sku
category
unitPrice
currentStock
minimumStock
warehouseLocation
createdAt
updatedAt
```

## StockMovement

```text
id
productId
quantity
movementType
reason
createdBy
createdAt
```

`movementType`:

```text
IN
OUT
```

## Challan

```text
id
challanNumber
customerId
status
totalQuantity
createdBy
createdAt
updatedAt
```

Status:

```text
DRAFT
CONFIRMED
CANCELLED
```

## ChallanItem

```text
id
challanId
productId
productNameSnapshot
skuSnapshot
unitPriceSnapshot
quantity
```

### Important relationships

```text
User → CustomerFollowUp
User → StockMovement
User → Challan

Customer → CustomerFollowUp
Customer → Challan

Product → StockMovement
Product → ChallanItem

Challan → ChallanItem
```

Then:

```text
npx prisma migrate dev
```

---

# 3. Backend Structure

Keep it simple.

```text
src/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── customers/
│   ├── products/
│   ├── inventory/
│   └── challans/
├── prisma/
├── app.ts
└── server.ts
```

For each module:

```text
routes
controller
service
schema
```

Example:

```text
customers/
├── customer.routes.ts
├── customer.controller.ts
├── customer.service.ts
└── customer.schema.ts
```

---

# 4. Build Authentication

Do this first.

### Build

1. User model
2. Seed 4 users
3. Login controller
4. Login service
5. JWT generation
6. Auth middleware
7. Role middleware

### Route

```http
POST /api/auth/login
```

Test:

```text
Admin
Sales
Warehouse
Accounts
```

---

# 5. Customer Module

Build:

```text
Customer model
↓
Schema
↓
Service
↓
Controller
↓
Routes
```

### Routes

```http
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
```

Follow-ups:

```http
GET  /api/customers/:id/followups
POST /api/customers/:id/followups
```

Add basic search:

```http
GET /api/customers?search=abc
```

Test everything in Postman.

---

# 6. Product Module

Build:

```text
Product
↓
Schema
↓
Service
↓
Controller
↓
Routes
```

### Routes

```http
GET    /api/products
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
```

Also:

```http
GET /api/products?lowStock=true
```

Rules:

```text
SKU unique
price >= 0
stock >= 0
minimumStock >= 0
```

---

# 7. Inventory Module

Build stock IN/OUT.

### Routes

```http
GET  /api/stock-movements
POST /api/stock-movements
```

When stock changes:

```text
Update Product.currentStock
+
Create StockMovement
```

Do both inside one transaction.

### Stock IN

```text
10 + 5 = 15
```

### Stock OUT

```text
10 - 4 = 6
```

Never allow:

```text
10 - 15 = -5
```

Return an error instead.

---

# 8. Challan Module — Most Important

Build this after inventory.

### Routes

```http
GET  /api/challans
POST /api/challans
GET  /api/challans/:id
PATCH /api/challans/:id

POST /api/challans/:id/confirm
POST /api/challans/:id/cancel
```

### Create Draft

User selects:

```text
Customer
Product 1 + quantity
Product 2 + quantity
...
```

Save:

```text
DRAFT
```

**Do not reduce stock.**

### Confirm

When:

```text
DRAFT → CONFIRMED
```

do:

```text
1. Check status
2. Check every product exists
3. Check stock
4. Reduce stock
5. Create OUT stock movements
6. Update challan to CONFIRMED
```

All inside **one Prisma transaction**.

If anything fails:

```text
ROLLBACK
```

### Important

Prevent:

```text
CONFIRMED → CONFIRMED
```

and:

```text
CONFIRMED → DRAFT
```

Store product snapshots:

```text
productNameSnapshot
skuSnapshot
unitPriceSnapshot
```

This protects old challan data if the product changes later.

---

# 9. Backend Error Handling

Create one simple error middleware.

Handle:

```text
400 → Bad request
401 → Not logged in
403 → Wrong role
404 → Not found
409 → Conflict
500 → Server error
```

Use a consistent response:

```json
{
  "success": false,
  "message": "Insufficient stock"
}
```

---

# 10. Backend Validation

Use Zod only on the backend.

Validate:

```text
required fields
email
mobile
positive quantity
non-negative price
valid role
valid status
unique SKU
```

Don't spend time building complicated validation systems.

---

# 11. Test Backend Completely Before Frontend

This is important.

Use Postman.

Test this exact flow:

```text
Login
 ↓
Create Customer
 ↓
Create Product
 ↓
Add Stock
 ↓
Check Stock
 ↓
Create Draft Challan
 ↓
Check Stock → unchanged
 ↓
Confirm Challan
 ↓
Check Stock → reduced
 ↓
Check Stock Movement
```

Then test:

```text
Insufficient stock
Double confirmation
Multiple products
Invalid token
Wrong role
```

**Do not start frontend until this flow works.**

---

# 12. Minimal Frontend

Only create these pages:

```text
/login

/dashboard

/customers
/customers/new
/customers/:id

/products
/products/new

/stock-movements

/challans
/challans/new
/challans/:id
```

## UI rules

```text
Black
White
One font
Simple borders
Simple tables
Simple buttons
Simple forms
```

No:

```text
Animations
Gradients
Fancy cards
Charts
Complex sidebar
Dark mode
Fancy dashboard
```

The UI only needs to prove the backend works.

---

# 13. Frontend Build Order

Do it in this order:

### 1. Login

```text
email
password
login button
```

### 2. Dashboard

Show only:

```text
Customers
Products
Low Stock
Challans
```

### 3. Customers

```text
List
Add
Edit
Search
Details
Follow-up
```

### 4. Products

```text
List
Add
Edit
Stock
Low stock
```

### 5. Stock

```text
Stock movement table
Add IN/OUT
```

### 6. Challans

```text
List
Create
View
Confirm
Cancel
```

That's enough.

---

# 14. Deployment

Use the easiest free setup:

```text
Frontend → Vercel
Backend  → Render
Database → Neon
```

Set:

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL
NODE_ENV
```

Frontend:

```text
VITE_API_URL
```

---

# 15. README

Keep it short.

Include:

```text
Project overview
Features
Tech stack
How to run backend
How to run frontend
Environment variables
Database setup
Test credentials
API/Postman
Live URLs
Architecture
Known limitations
```

---

# 16. Git Commits

Make simple meaningful commits:

```text
init project
setup database
add authentication
add customer module
add product module
add inventory
add challan module
add frontend
connect frontend APIs
deploy application
add README
```

---

# 17. Ignore These Until Everything Works

Do NOT touch these early:

```text
Swagger
Docker
GitHub Actions
AWS
PDF invoice
S3 images
Advanced dashboard
Advanced testing
Fancy UI
```

They are bonus features.

---

# 18. Final Build Order

Follow this exact sequence:

```text
1. Project setup
        ↓
2. Prisma + PostgreSQL
        ↓
3. Database schema
        ↓
4. Seed users
        ↓
5. Authentication
        ↓
6. Customers
        ↓
7. Products
        ↓
8. Inventory
        ↓
9. Challans
        ↓
10. Postman testing
        ↓
11. React setup
        ↓
12. Login
        ↓
13. Customers UI
        ↓
14. Products UI
        ↓
15. Inventory UI
        ↓
16. Challans UI
        ↓
17. Connect everything
        ↓
18. Deploy
        ↓
19. README
        ↓
20. Final testing
```

---

# 19. Priority

## MUST WORK

```text
Authentication
RBAC
Customers
Products
Inventory
Stock movements
Challans
Stock validation
Transactions
Product snapshots
Validation
Error handling
Deployment
README
```

## NICE TO HAVE

```text
Dashboard
Search
Pagination
Swagger
Tests
```

## IGNORE FOR NOW

```text
Docker
AWS
PDF
S3
GitHub Actions
Fancy UI
```

---

# 20. The Main Rule

Don't try to build an ERP.

Build **one clean working flow**:

```text
Login
  ↓
Customer
  ↓
Product
  ↓
Stock IN
  ↓
Create Challan
  ↓
Confirm Challan
  ↓
Stock OUT
  ↓
Audit Movement
```

If this works reliably, with the required CRUD, roles, validation and deployment, the assignment is in a strong state.

**Correctness > UI > Bonus features.**
