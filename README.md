# Issue Tracker - iTracker

A robust, multi-tenant issue tracking system built with a modern technology stack.

## 🚀 Overview

This application is designed as a Software as a Service (SaaS) platform where multiple organizations identified as Tenants can manage their issues in complete isolation. Each organization has its own set of users, issues, and audit logs.

## 🏗 Multi-Tenancy Architecture

The application implements **Logical Isolation** at the database level.

### How it works:

1.  **Tenant Entity**: The root of the hierarchy is the `Tenant` model.
2.  **Data Isolation**: Every core entity (`User`, `Issue`, `AuditLog`) is linked to a `TenantId`.
3.  **Strict Filtering**:
    - Upon registration, a new `Tenant` is automatically created.
    - When a user logs in, their `tenantId` is embedded in a secure JWT.
    - The `authMiddleware` extracts this `tenantId` from every request.
    - All database queries are scoped using `where: { tenantId: req.tenantId }`, ensuring users can **never** access data from another organization.

### Who can access?

Data is strictly isolated. A user from "Organization A" cannot see or modify issues from "Organization B", even if they have a valid session. Access is globally restricted by the `tenantId` enforced at the API layer.

#### Adding Multiple Users

The system now supports multiple users per organization. Once an organization is created, the primary user can add colleagues using the `POST /auth/add-user` endpoint. All users added this way are bound to the same `tenantId`.

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend**: Node.js & Express (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT & Bcrypt

## 📋 Features

- **Tenant-Based Registration**: Create your organization and first admin user in one step.
- **Issue Management**: Create, update, assign, and track issues within your tenant.
- **Audit Logging**: Every action (create, update, delete) is logged with a timestamp and user ID.
- **Secure Auth**: JWT-based authentication with tenant-scoping.

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repo-url>
    cd IssueTracker
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in `apps/api/`:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/issuetracker"
    JWT_SECRET="your-secret-key"
    ```

4.  **Database Migration**:

    ```bash
    cd apps/api
    npx prisma migrate dev
    ```

5.  **Run the application**:
    - **API**: `cd apps/api && npm run dev`
    - **Web**: `cd apps/web && npm run dev`

## 🔒 Security Note

The system uses `req.tenantId` for all Prisma operations. This prevents "ID guessing" attacks (IDOR), as the `tenantId` is cryptographically signed in the JWT and cannot be tampered with by the client.
