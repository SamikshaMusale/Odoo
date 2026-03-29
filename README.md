# ODOO Hackathon - ReimburseFlow

A clean, end-to-end expense reimbursement platform for modern teams. ReimburseFlow covers company creation, admin onboarding, expense submission, approvals, and audit-friendly tracking in one workflow.

## Features

- Company setup with admin signup and secure login
- Role-based access for admin, manager, and employee workflows
- Expense submission with metadata, currency, and status tracking
- Multi-step approvals with logs and traceability
- Dashboard views for expenses, approvals, and users

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express, Prisma ORM |
| Database | MySQL |
| Auth | JWT, bcrypt |

## Project Structure

```
reimbursement-backend/   Express API, Prisma, MySQL
reimbursement-frontend/  React client (Vite)
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+

### Install

```bash
npm run install:all
```

### Backend Environment

Create `reimbursement-backend/.env` and configure at least:

```
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=your_secret
```

Optional values:

```
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
JWT_EXPIRES_IN=7d
```

### Database

```bash
cd reimbursement-backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### Run the App

From the repo root:

```bash
npm run dev
```

Or run each service separately:

```bash
npm run backend
npm run frontend
```

### Health Check

```
GET http://localhost:3000/health
```

## License

MIT License
Copyright © 2026