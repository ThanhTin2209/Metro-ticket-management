# Metro Ticket Management System

A full-stack web application for managing metro train tickets, built with **React 19** (frontend) and **Node.js/Express** (backend). The system supports role-based access control with four user roles: Passenger, Staff, Inspector, and Admin.

## Tech Stack

**Frontend**
- React 19, Vite 5
- React Router 7
- Tailwind CSS 3
- Axios, Socket.io-client

**Backend**
- Node.js, Express.js
- MongoDB, Mongoose
- Socket.io (Realtime)
- JWT Authentication

## Features

- **Authentication** — Register, login, JWT access/refresh token, protected routes
- **Passenger** — Purchase tickets, top-up balance, view transaction history, QR code tickets
- **Staff** — Validate tickets at gates (ALLOW / DENY / EXPIRED), view validation history, report incidents
- **Inspector** — Manual ticket inspection, create violation reports, inspection statistics
- **Admin** — Manage users/stations/routes, revenue reports & analytics, system settings
- **Realtime** — Socket.io integration for live dashboard updates and notifications

## Getting Started

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install

# Run backend (http://localhost:3000)
cd backend && npm run dev

# Run frontend (http://localhost:5173)
cd frontend && npm run dev
```

> Copy `backend/.env.example` to `backend/.env` and configure your MongoDB connection string before running.

## Demo Accounts

| Role      | Email                    | Password       |
|-----------|--------------------------|----------------|
| Admin     | admin@metro.com          | admin123       |
| Staff     | staff@metro.com          | staff123       |
| Inspector | inspector@metro.com      | inspector123   |
| Passenger | passenger@metro.com      | passenger123   |
