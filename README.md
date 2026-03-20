# 📚 Alim Library System

A full-stack web application for managing a digital library — built for students, librarians, and administrators.

---

## Overview

Alim Library is a library management system that allows users to browse books, track reading sessions, and manage library resources in real time. It is designed to streamline day-to-day library operations while giving students an accessible platform to discover and read books.

---

## Features

### For Students
- Browse and search the book catalog by title, author, or ISBN
- View book availability and details
- Read books directly in the browser
- Track personal reading sessions

### For Librarians
- Add, edit, and delete books from the catalog
- Upload book covers and PDF content
- Toggle book availability in real time

### For Admins
- Full user management — add, edit, suspend, or delete users
- Dashboard with live analytics:
  - Books added per month
  - Top readers and most-read books
  - Reading time statistics
  - User activity and role breakdown
- Recent activity feed across users, books, and sessions

### General
- Real-time updates across all connected clients via WebSockets
- Role-based access control (admin, librarian, student)
- User profile and password management
- Customizable avatar color

---

## Tech Stack

**Frontend**
- React + Vite
- Axios for API requests
- Socket.IO client for real-time updates
- React Router for navigation

**Backend**
- Node.js + Express
- Socket.IO for WebSocket events
- JWT for authentication
- bcrypt for password hashing

**Database & Storage**
- Supabase (PostgreSQL) for the database
- Supabase Storage for book covers and PDF content

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## Project Structure

```
library/
├── frontend/
│   └── src/
│       ├── api/          # API call functions
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Page components
│       └── socket.js     # Socket.IO client setup
└── backend/
    └── routes/
        ├── auth/         # Login, register, user status
        ├── books/        # Book CRUD and reading sessions
        ├── dashboard/    # Analytics and activity feed
        ├── users/        # Admin user management
        └── settings/     # Profile and password settings
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js
- A Supabase project with the required tables set up

### Backend
```bash
cd backend
npm install
```

Create a `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Start the server:
```bash
node index.js
```

### Frontend
```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:3000
```

Start the dev server:
```bash
npm run dev
```

---

## Live Demo

- **Frontend:** https://alimbrary.vercel.app
- **Backend:** Hosted on Render
