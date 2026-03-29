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

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.