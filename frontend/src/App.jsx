// App.jsx
import { Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard.jsx';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Home from './pages/home.jsx';
import PageLayout from './components/layout/layout.jsx'
import Dashboard from './pages/dashboard/dashboard.jsx';
import Books from './pages/books/books.jsx';
import Users from './pages/users/users.jsx';
import Settings from './pages/settings/settings.jsx';
import Unauthorized from './pages/unauthorized.jsx';

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/auth/login" element={<Login />} />
      <Route
        path="/auth/login"
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <RedirectIfAuthenticated>
            <Signup />
          </RedirectIfAuthenticated>
        }
      />

      {/* Protected Route */}

      <Route
        path="/dashboard"
        element={
          <AuthGuard allowedRoles={['admin', 'librarian']}>
            <PageLayout>
              <Dashboard />
            </PageLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/books"
        element={
          <AuthGuard allowedRoles={['student', 'admin', 'librarian']}>
            <PageLayout>
              <Books />
            </PageLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/users"
        element={
          <AuthGuard allowedRoles={['admin']}>
            <PageLayout>
              <Users />
            </PageLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/settings"
        element={
          <AuthGuard allowedRoles={['student', 'admin', 'librarian']}>
            <PageLayout>
              <Settings />
            </PageLayout>
          </AuthGuard>
        }
      />

    </Routes >
  );
}

export default App;
