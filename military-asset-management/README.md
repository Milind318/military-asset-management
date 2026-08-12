# Military Asset Management System - MySQL Version

This version has been converted from PostgreSQL to MySQL for use with MySQL Workbench.

## Stack

Frontend:
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

Backend:
- Node.js
- Express.js
- MySQL2
- JWT
- Bcrypt
- Helmet
- CORS

Database:
- MySQL 8.x
- MySQL Workbench

## 1. Create the database

Open MySQL Workbench and open `database/schema.sql`.

Run the complete SQL script.

It creates:
- military_assets
- bases
- users
- equipment_types
- purchases
- transfers
- assignments
- expenditures
- audit_logs

## 2. Backend

Open PowerShell:

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=military_assets
JWT_SECRET=my_super_secret_key_change_this
```

Then:

```powershell
npm run seed
npm run dev
```

Backend:
http://localhost:5000

## 3. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Then:

```powershell
npm run dev
```

Open:
http://localhost:5173

## 4. Demo accounts

Admin:
admin_user
AdminPass123!

Base Commander:
commander_alpha
CommandPass123!

Logistics Officer:
logistics_officer
LogisticsPass123!

## 5. Main API routes

POST /api/auth/login
GET /api/auth/me

GET /api/assets/dashboard
GET /api/assets/inventory
GET /api/assets/bases
GET /api/assets/equipment

GET/POST /api/purchases
GET/POST /api/transfers

GET/POST /api/operations/assignments
GET/POST /api/operations/expenditures

## 6. Business formulas

Closing Balance =
Opening Balance + Net Movement - Assigned - Expended

Net Movement =
Purchases + Transfers In - Transfers Out

## 7. MySQL notes

The backend uses `mysql2/promise` and MySQL connection pooling.

Database transactions use:
- beginTransaction()
- commit()
- rollback()

SQL parameters use MySQL `?` placeholders instead of PostgreSQL `$1`, `$2`, etc.

## 8. Deployment

Frontend can be deployed to Vercel or Netlify.

Backend can be deployed to Render or Railway.

For production MySQL, use a managed MySQL service and update:
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME

Do not commit `.env` to GitHub.

## 9. Security

This project is intended as an educational/assignment implementation. Before real production use, perform a full security review, use HTTPS, rotate secrets, add rate limiting, stronger input validation, and appropriate database concurrency controls. Do not use real sensitive military inventory data in this demo.
