# Admin Role Management - Complete API Flow

This document outlines the complete workflow for an admin to manage users and enable employees to submit expenses.

## 1. Admin Signup (Create Company & Admin Account)

**Endpoint:** `POST /api/v1/auth/register`

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@company.com",
    "password": "SecurePass123",
    "companyName": "TechCorp",
    "defaultCurrency": "USD"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Company and admin account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-admin-1",
      "name": "John Admin",
      "email": "admin@company.com",
      "role": "ADMIN"
    },
    "company": {
      "id": "uuid-company-1",
      "name": "TechCorp"
    }
  }
}
```

**Store the token** for subsequent requests.

---

## 2. Get Current User Details

**Endpoint:** `GET /api/v1/users/me`

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid-admin-1",
    "name": "John Admin",
    "email": "admin@company.com",
    "role": "ADMIN",
    "companyId": "uuid-company-1",
    "managerId": null,
    "company": {
      "id": "uuid-company-1",
      "name": "TechCorp",
      "defaultCurrency": "USD"
    }
  }
}
```

---

## 3. Create Managers

**Endpoint:** `POST /api/v1/users/`

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Manager",
    "email": "sarah@company.com",
    "password": "SecurePass123",
    "role": "MANAGER"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "MANAGER created successfully",
  "data": {
    "id": "uuid-manager-1",
    "name": "Sarah Manager",
    "email": "sarah@company.com",
    "role": "MANAGER",
    "managerId": null,
    "createdAt": "2024-03-29T12:00:00.000Z"
  }
}
```

---

## 4. Create Employees

**Endpoint:** `POST /api/v1/users/`

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Employee",
    "email": "mike@company.com",
    "password": "SecurePass123",
    "role": "EMPLOYEE",
    "managerId": "uuid-manager-1"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "EMPLOYEE created successfully",
  "data": {
    "id": "uuid-employee-1",
    "name": "Mike Employee",
    "email": "mike@company.com",
    "role": "EMPLOYEE",
    "managerId": "uuid-manager-1",
    "createdAt": "2024-03-29T12:00:00.000Z"
  }
}
```

---

## 5. Assign Manager to Existing Employee

**Endpoint:** `PATCH /api/v1/users/:userId/assign-manager`

```bash
curl -X PATCH http://localhost:3000/api/v1/users/uuid-employee-2/assign-manager \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "managerId": "uuid-manager-1"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Manager assigned successfully",
  "data": {
    "id": "uuid-employee-2",
    "name": "Jane Employee",
    "email": "jane@company.com",
    "role": "EMPLOYEE",
    "managerId": "uuid-manager-1"
  }
}
```

---

## 6. Update User Role (Promote/Demote)

**Endpoint:** `PATCH /api/v1/users/:userId/role`

### Promote Employee to Manager:
```bash
curl -X PATCH http://localhost:3000/api/v1/users/uuid-employee-1/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "MANAGER"
  }'
```

### Demote Manager to Employee:
```bash
curl -X PATCH http://localhost:3000/api/v1/users/uuid-manager-1/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "EMPLOYEE"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "uuid-employee-1",
    "name": "Mike Employee",
    "email": "mike@company.com",
    "role": "MANAGER",
    "managerId": null
  }
}
```

**Note:** When demoting a manager to employee, subordinates' manager assignments are automatically cleared.

---

## 7. List All Company Users

**Endpoint:** `GET /api/v1/users/`

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid-admin-1",
      "name": "John Admin",
      "email": "admin@company.com",
      "role": "ADMIN",
      "managerId": null,
      "createdAt": "2024-03-29T10:00:00.000Z",
      "manager": null
    },
    {
      "id": "uuid-manager-1",
      "name": "Sarah Manager",
      "email": "sarah@company.com",
      "role": "MANAGER",
      "managerId": null,
      "createdAt": "2024-03-29T11:00:00.000Z",
      "manager": null
    },
    {
      "id": "uuid-employee-1",
      "name": "Mike Employee",
      "email": "mike@company.com",
      "role": "EMPLOYEE",
      "managerId": "uuid-manager-1",
      "createdAt": "2024-03-29T12:00:00.000Z",
      "manager": {
        "id": "uuid-manager-1",
        "name": "Sarah Manager"
      }
    }
  ]
}
```

---

## 8. Employee Login & Submit Expense

### 8a. Employee Login

**Endpoint:** `POST /api/v1/auth/login`

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mike@company.com",
    "password": "SecurePass123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-employee-1",
      "name": "Mike Employee",
      "email": "mike@company.com",
      "role": "EMPLOYEE"
    },
    "company": {
      "id": "uuid-company-1",
      "name": "TechCorp"
    }
  }
}
```

### 8b. Submit Expense

**Endpoint:** `POST /api/v1/expenses/`

```bash
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Authorization: Bearer EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.50,
    "currency": "USD",
    "category": "MEALS",
    "description": "Team lunch meeting",
    "date": "2024-03-29T12:30:00.000Z"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense submitted successfully",
  "data": {
    "id": "uuid-expense-1",
    "amount": 150.50,
    "currency": "USD",
    "category": "MEALS",
    "description": "Team lunch meeting",
    "date": "2024-03-29T12:30:00.000Z",
    "status": "IN_REVIEW",
    "userId": "uuid-employee-1",
    "approvalSteps": [
      {
        "id": "uuid-step-1",
        "stepOrder": 1,
        "status": "PENDING",
        "approver": {
          "id": "uuid-manager-1",
          "name": "Sarah Manager",
          "role": "MANAGER"
        }
      },
      {
        "id": "uuid-step-2",
        "stepOrder": 2,
        "status": "PENDING",
        "approver": {
          "id": "uuid-admin-1",
          "name": "John Admin",
          "role": "ADMIN"
        }
      }
    ]
  }
}
```

---

## 9. Manager Approves Expense

**Endpoint:** `POST /api/v1/approvals/:stepId/approve`

```bash
curl -X POST http://localhost:3000/api/v1/approvals/uuid-step-1/approve \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Approved - legitimate business meal"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense approved",
  "data": {
    "id": "uuid-expense-1",
    "amount": 150.50,
    "currency": "USD",
    "status": "IN_REVIEW",
    "user": {
      "id": "uuid-employee-1",
      "name": "Mike Employee"
    },
    "approvalSteps": [
      {
        "id": "uuid-step-1",
        "status": "APPROVED",
        "approver": {
          "id": "uuid-manager-1",
          "name": "Sarah Manager"
        }
      },
      {
        "id": "uuid-step-2",
        "status": "PENDING",
        "approver": {
          "id": "uuid-admin-1",
          "name": "John Admin"
        }
      }
    ]
  }
}
```

---

## 10. Admin Final Approval

**Endpoint:** `POST /api/v1/approvals/:stepId/approve`

```bash
curl -X POST http://localhost:3000/api/v1/approvals/uuid-step-2/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Final approval"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense approved",
  "data": {
    "id": "uuid-expense-1",
    "amount": 150.50,
    "currency": "USD",
    "status": "APPROVED",
    "user": {
      "id": "uuid-employee-1",
      "name": "Mike Employee"
    },
    "approvalSteps": [
      {
        "id": "uuid-step-1",
        "status": "APPROVED",
        "approver": {
          "id": "uuid-manager-1",
          "name": "Sarah Manager"
        }
      },
      {
        "id": "uuid-step-2",
        "status": "APPROVED",
        "approver": {
          "id": "uuid-admin-1",
          "name": "John Admin"
        }
      }
    ]
  }
}
```

---

## Summary

✅ **Admin Setup Complete**
1. Admin signs up (creates company & admin account)
2. Admin creates managers and employees
3. Admin can change roles anytime
4. Employees can login and submit expenses
5. Manager approves → Admin final approval
6. Expense status changes to APPROVED

All approvals are tracked with timestamps and comments for audit trails.
