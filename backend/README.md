# Metro Ticket Management System — Backend

Node.js/Express REST API with realtime support for the Metro Ticket Management System.

## Tech Stack

- **Node.js**, **Express.js**
- **MongoDB** + **Mongoose**
- **Socket.io** — Realtime events by user role
- **JWT** — Access & refresh token authentication
- **Joi** — Request validation
- **worker_threads** — Background report processing
- **Rate limiting** — In-memory per-route limiting
- **Idempotency-Key** — Safe report creation

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
```

## API Overview

| Group   | Method | Endpoint                                        | Role              |
|---------|--------|-------------------------------------------------|-------------------|
| Auth    | POST   | `/api/auth/register`                            | Public            |
| Auth    | POST   | `/api/auth/login`                               | Public            |
| Auth    | POST   | `/api/auth/refresh-token`                       | Public            |
| Auth    | POST   | `/api/auth/logout`                              | Authenticated     |
| Users   | GET    | `/api/users/me`                                 | Authenticated     |
| Users   | GET    | `/api/users`                                    | Admin             |
| Users   | PATCH  | `/api/users/:id/role`                           | Admin             |
| Metro   | POST   | `/api/metro/tickets/:code/validate-entry`       | Staff, Admin      |
| Metro   | POST   | `/api/metro/tickets/:code/manual-inspection`    | Inspector, Admin  |
| Reports | POST   | `/api/reports`                                  | Admin             |
| Reports | GET    | `/api/reports`                                  | Admin             |
| Reports | GET    | `/api/reports/:id/download`                     | Admin             |

## Realtime Events (Socket.io)

| Event                                   | Description                        |
|-----------------------------------------|------------------------------------|
| `metro.ticket.entryValidated`           | Fired when a ticket is validated   |
| `metro.ticket.manualInspectionCreated` | Fired on manual inspection         |
| `report.created`                        | Fired when a new report is created |
| `report.statusChanged`                  | Fired on report status update      |
