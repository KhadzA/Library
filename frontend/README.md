# Frontend — Alim Library

The client-side of the Alim Library System, built with React and Vite.

---

## Tech Stack

- **React** — UI framework
- **Vite** — build tool and dev server
- **React Router** — client-side routing
- **Axios** — HTTP requests to the backend API
- **Socket.IO Client** — real-time book and user updates
- **jwt-decode** — decoding JWT tokens on the client
- **Lucide React** — icon library

---

## Project Structure

```
frontend/
├── public/
└── src/
    ├── api/              # All backend API call functions
    │   ├── auth.js       # Login, register, logout, status
    │   ├── book.js       # Book CRUD, ISBN metadata fetch
    │   ├── readBook.js   # Reading session start/end
    │   ├── dashboard.js  # Analytics and activity feed
    │   ├── users.js      # Admin user management
    │   └── settings.js   # Profile and password updates
    ├── components/       # Reusable UI components
    ├── hooks/
    │   ├── bookHook.js           # Book list with real-time socket sync
    │   └── useSocketConnection.js # Socket auth and token expiry handling
    ├── pages/            # Page-level components
    ├── socket.js         # Socket.IO client instance
    ├── App.jsx
    └── main.jsx
```

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://localhost:3000
```

For production, set this to your Render backend URL.

### Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

---

## Deployment

Deployed on **Vercel**.

- Set the root directory to `frontend` in your Vercel project settings
- Add the environment variable `VITE_API_URL` pointing to your Render backend URL
- A `vercel.json` is included at the frontend root to handle React Router page refreshes:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Real-time Features

The frontend connects to the backend via Socket.IO. Events handled:

| Event | Effect |
|---|---|
| `bookAdded` | Appends new book to the list |
| `bookUpdated` | Replaces updated book in the list |
| `bookDeleted` | Removes book from the list |
| `bookAvailabilityUpdated` | Updates availability badge in real time |
| `tokenExpired` | Logs user out and redirects to login |
