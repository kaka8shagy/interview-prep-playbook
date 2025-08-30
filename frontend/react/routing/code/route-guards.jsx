/**
 * File: route-guards.jsx
 * Description: Authentication and authorization patterns in React Router
 * 
 * Learning objectives:
 * - Implement route protection with authentication checks
 * - Create role-based access control for different user types
 * - Handle redirect logic with preserved return URLs
 * - Manage authentication state across route transitions
 * 
 * Key concepts demonstrated:
 * - Higher-order components for route protection
 * - Custom hooks for authentication state management
 * - Redirect patterns with location state preservation
 * - Context-based auth state sharing
 * - Loading states during authentication verification
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';

// Authentication Context for sharing auth state across components
const AuthContext = createContext();

// Authentication provider component manages auth state
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simulate authentication check on app startup
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Simulate API call to check current authentication status
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for stored auth token (in real app, validate with server)
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      
      if (token) {
        // Simulate user data based on stored information
        setUser({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          role: userRole || 'user',
          token: token
        });
      }
    } catch (err) {
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };
  
  // Login function with role simulation
  const login = async (email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple credential check for demo
      if (email === 'admin@example.com' && password === 'admin123') {
        const userData = {
          id: '1',
          name: 'Admin User',
          email: email,
          role: 'admin',
          token: 'fake-admin-token'
        };
        
        setUser(userData);
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userRole', userData.role);
        return { success: true, user: userData };
      } else if (email === 'user@example.com' && password === 'user123') {
        const userData = {
          id: '2',
          name: 'Regular User',
          email: email,
          role: 'user',
          token: 'fake-user-token'
        };
        
        setUser(userData);
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userRole', userData.role);
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  };
  
  // Context value provided to all children
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    hasRole: (role) => user?.role === role
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route component - redirects to login if not authenticated
function ProtectedRoute({ children, requiredRole = null, fallback = '/login' }) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Verifying authentication...</div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  // Preserve the attempted location for redirect after login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallback} 
        state={{ from: location }} 
        replace 
      />
    );
  }
  
  // Check role-based access if required role is specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required role: {requiredRole}</p>
        <p>Your role: {user.role}</p>
        <Link to="/">Go to Home</Link>
      </div>
    );
  }
  
  // Render the protected content
  return children;
}

// Admin-only route component
function AdminRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="admin" fallback="/access-denied">
      {children}
    </ProtectedRoute>
  );
}

// Route component that redirects authenticated users (for login/register pages)
function PublicRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // Redirect authenticated users away from public-only pages
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
}

// Main App component with route protection
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          
          <main className="main-content">
            <Routes>
              {/* Public routes accessible to everyone */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Public-only routes (redirect if authenticated) */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />
              
              {/* Protected routes requiring authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin-only routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } 
              />
              
              {/* Access denied page */}
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Navigation component showing auth-aware navigation
function Navigation() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  return (
    <nav className="navigation">
      <Link to="/" className="nav-logo">MyApp</Link>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        
        {/* Show different navigation based on auth state */}
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            
            {/* Admin-only navigation */}
            {isAdmin && (
              <Link to="/admin" className="admin-link">
                Admin Panel
              </Link>
            )}
            
            <div className="user-menu">
              <span className="user-greeting">
                Hello, {user.name} ({user.role})
              </span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// Login page with redirect after authentication
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to the page user was trying to access
      navigate(from, { replace: true });
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-form">
        <h2>Login to Your Account</h2>
        
        {/* Show where user will be redirected after login */}
        {from !== '/' && (
          <div className="redirect-notice">
            You'll be redirected to: {from}
          </div>
        )}
        
        {/* Demo credentials helper */}
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Admin:</strong> admin@example.com / admin123</p>
          <p><strong>User:</strong> user@example.com / user123</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

// Simple register page
function RegisterPage() {
  return (
    <div className="register-page">
      <h2>Create Account</h2>
      <p>Registration form would go here.</p>
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}

// Home page - accessible to everyone
function HomePage() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="home-page">
      <h1>Welcome to Route Guards Demo</h1>
      
      {isAuthenticated ? (
        <div className="authenticated-content">
          <p>Hello, {user.name}! You are logged in as: {user.role}</p>
          <div className="quick-links">
            <Link to="/dashboard">Go to Dashboard</Link>
            <Link to="/profile">View Profile</Link>
            {user.role === 'admin' && (
              <Link to="/admin">Admin Panel</Link>
            )}
          </div>
        </div>
      ) : (
        <div className="unauthenticated-content">
          <p>You are not logged in. Some features require authentication.</p>
          <div className="auth-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
          </div>
          
          <div className="protected-links">
            <h3>Try accessing protected pages:</h3>
            <Link to="/dashboard">Dashboard (requires login)</Link>
            <Link to="/admin">Admin Panel (requires admin role)</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// About page - public page
function AboutPage() {
  return (
    <div className="about-page">
      <h2>About Our App</h2>
      <p>This is a public page demonstrating route protection patterns.</p>
    </div>
  );
}

// Protected dashboard page
function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="dashboard-page">
      <h2>User Dashboard</h2>
      <p>Welcome to your dashboard, {user.name}!</p>
      <p>This page is only accessible to authenticated users.</p>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Your Profile</h3>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <Link to="/profile">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
}

// Protected profile page
function ProfilePage() {
  const { user } = useAuth();
  
  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>
    </div>
  );
}

// Admin-only pages
function AdminPanel() {
  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <p>This page is only accessible to administrators.</p>
      
      <div className="admin-links">
        <Link to="/admin/users">Manage Users</Link>
        <Link to="/admin/settings">System Settings</Link>
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div className="user-management">
      <h2>User Management</h2>
      <p>Admin-only user management interface.</p>
      <Link to="/admin">← Back to Admin Panel</Link>
    </div>
  );
}

// Access denied page
function AccessDeniedPage() {
  const { user } = useAuth();
  
  return (
    <div className="access-denied-page">
      <h2>Access Denied</h2>
      <p>You don't have permission to access the requested page.</p>
      {user && <p>Your current role: {user.role}</p>}
      <div className="access-denied-links">
        <Link to="/">Go Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}

// 404 page
function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}

export default App;

// Key Route Protection Patterns Demonstrated:

// 1. Authentication Context:
//    - Centralized auth state management
//    - Persistent authentication across page reloads
//    - Loading states during auth verification

// 2. Protected Route Component:
//    - Wrapper component that checks authentication
//    - Automatic redirect to login with return URL preservation
//    - Role-based access control support

// 3. Redirect Patterns:
//    - Preserve intended destination in location state
//    - Navigate to preserved location after successful login
//    - Replace history to prevent back button issues

// 4. Role-based Access Control:
//    - Different user roles with different permissions
//    - Component-level role checking
//    - Graceful handling of insufficient permissions

// 5. Loading States:
//    - Handle async authentication verification
//    - Prevent flash of incorrect content
//    - User-friendly loading indicators

// 6. Public vs Private Routes:
//    - Routes that redirect authenticated users (login/register)
//    - Routes that require authentication
//    - Routes that require specific roles

// 7. Navigation Integration:
//    - Context-aware navigation menus
//    - Role-based link visibility
//    - User status indicators

// Best Practices for Route Protection:
// - Always check auth state on app initialization
// - Handle loading states gracefully
// - Preserve user's intended destination
// - Provide clear feedback for access denied scenarios
// - Implement proper cleanup on logout
// - Use proper HTTP status codes for server-side routing