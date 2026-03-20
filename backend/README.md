# Backend — Alim Library

The server-side of the Alim Library System, built with Node.js and Express.

---

## Tech Stack

- **Node.js + Express** — HTTP server and routing
- **Socket.IO** — WebSocket server for real-time events
- **Supabase JS** — PostgreSQL database and file storage client
- **JWT (jsonwebtoken)** — token-based authentication
- **bcrypt** — password hashing
- **multer** — multipart file upload handling (memory storage)
- **validator** — input validation

---

## Project Structure

```
backend/
├── routes/
│   ├── auth/
│   │   ├── login.js       # POST /api/login
│   │   ├── register.js    # POST /api/register
│   │   └── user.js        # POST /api/user/active-status, inactive-status
│   ├── books/
│   │   ├── book.js        # GET/POST/DELETE /api/books
│   │   └── read.js        # POST /api/books/start-read, end-read
│   ├── dashboard/
│   │   └── dashboard.js   # GET /api/dashboard/stats, analytics, activity
│   ├── users/
│   │   └── user.js        # GET/POST/PUT/DELETE /api/users
│   └── settings/
│       └── setting.js     # GET/PUT /api/settings/profile, password, avatar-color
├── db.js                  # Supabase client instance
├── index.js               # App entry point
└── .env                   # Environment variables (not committed)
```

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the `backend/` directory:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
PORT=3000
```

> Use the **service role key** from Supabase (not the anon key) so the backend has full database access.

### Run the server

```bash
node index.js
```

The server runs on `http://localhost:3000` by default.

---

## Database

Hosted on **Supabase** (PostgreSQL). The following tables are required:

| Table | Key Columns |
|---|---|
| `users` | `id`, `email`, `name`, `department`, `password`, `role`, `status`, `avatar_color`, `created_at` |
| `books` | `id`, `isbn`, `title`, `author`, `genre`, `description`, `department`, `availability`, `published_year`, `cover`, `content`, `created_at` |
| `reading_sessions` | `id`, `user_id`, `book_id`, `start_time`, `end_time`, `duration_minutes` |

Several analytics routes use **Supabase RPC functions** (PostgreSQL stored procedures) for queries that require grouping and joins. These are defined in the Supabase SQL Editor.

---

## File Storage

Book covers and PDF content are stored in **Supabase Storage**:

- `covers` bucket — public, stores book cover images
- `contents` bucket — private, stores book PDF files

Files are uploaded via `multer` memory storage and streamed directly to Supabase on each request.

---

## Deployment

Deployed on **Render** as a **Web Service**.

- Set the root directory to `backend`
- Build command: `npm install`
- Start command: `node index.js`
- Add all `.env` variables in the Render dashboard environment settings

> Render sets the `PORT` environment variable automatically — the server reads from `process.env.PORT` with a fallback to `3000`.

---

## Real-time Events

Socket.IO events emitted by the backend:

| Event | Trigger |
|---|---|
| `bookAdded` | New book is added |
| `bookUpdated` | Book details are edited |
| `bookDeleted` | Book is deleted |
| `bookAvailabilityUpdated` | Book availability is toggled |
| `tokenExpired` | JWT expiry timer fires on the socket connection |
