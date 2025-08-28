/**
 * File: hoc-authentication.jsx
 * Description: Authentication Higher-Order Component patterns
 * Tests understanding of HOCs for cross-cutting concerns like authentication and authorization
 */

import React, { useState, useEffect } from 'react';

// === Mock Authentication Service ===
class AuthService {
  static currentUser = null;
  static listeners = new Set();
  
  static async login(credentials) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.username === 'admin' && credentials.password === 'password') {
      this.currentUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin']
      };
    } else if (credentials.username === 'user' && credentials.password === 'password') {
      this.currentUser = {
        id: 2,
        username: 'user',
        email: 'user@example.com',
        role: 'user',
        permissions: ['read', 'write']
      };
    } else {
      throw new Error('Invalid credentials');
    }
    
    this.notifyListeners();
    return this.currentUser;
  }
  
  static async logout() {
    this.currentUser = null;
    this.notifyListeners();
  }
  
  static getCurrentUser() {
    return this.currentUser;
  }
  
  static isAuthenticated() {
    return this.currentUser !== null;
  }
  
  static hasRole(role) {
    return this.currentUser?.role === role;
  }
  
  static hasPermission(permission) {
    return this.currentUser?.permissions?.includes(permission) || false;
  }
  
  static subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  static notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

// === Basic Authentication HOC ===
function withAuthentication(WrappedComponent) {
  function AuthenticatedComponent(props) {
    const [user, setUser] = useState(AuthService.getCurrentUser());
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
      const unsubscribe = AuthService.subscribe((newUser) => {
        setUser(newUser);
        setLoading(false);
      });
      
      return unsubscribe;
    }, []);
    
    const login = async (credentials) => {
      setLoading(true);
      try {
        await AuthService.login(credentials);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    };
    
    const logout = async () => {
      setLoading(true);
      await AuthService.logout();
    };
    
    return (
      <WrappedComponent
        {...props}
        user={user}
        isAuthenticated={AuthService.isAuthenticated()}
        loading={loading}
        login={login}
        logout={logout}
      />
    );
  }
  
  AuthenticatedComponent.displayName = `withAuthentication(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
}

// === Require Authentication HOC ===
function requireAuthentication(WrappedComponent, options = {}) {
  const {
    redirectTo = '/login',
    LoadingComponent = () => <div>Loading...</div>,
    LoginComponent = DefaultLoginComponent
  } = options;
  
  function RequireAuthComponent(props) {
    const [user, setUser] = useState(AuthService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      // Check authentication status on mount
      setLoading(false);
      
      const unsubscribe = AuthService.subscribe((newUser) => {
        setUser(newUser);
        setLoading(false);
      });
      
      return unsubscribe;
    }, []);
    
    if (loading) {
      return <LoadingComponent />;
    }
    
    if (!user) {
      return <LoginComponent redirectTo={redirectTo} />;
    }
    
    return <WrappedComponent {...props} user={user} />;
  }
  
  RequireAuthComponent.displayName = `requireAuthentication(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return RequireAuthComponent;
}

// === Role-Based Authorization HOC ===
function requireRole(roles, options = {}) {
  const {
    FallbackComponent = DefaultUnauthorizedComponent,
    redirectTo = '/unauthorized'
  } = options;
  
  // Support both string and array of roles
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return function(WrappedComponent) {
    function RequireRoleComponent(props) {
      const [user, setUser] = useState(AuthService.getCurrentUser());
      
      useEffect(() => {
        const unsubscribe = AuthService.subscribe(setUser);
        return unsubscribe;
      }, []);
      
      if (!user) {
        return <DefaultLoginComponent />;
      }
      
      const hasRequiredRole = requiredRoles.some(role => AuthService.hasRole(role));
      
      if (!hasRequiredRole) {
        return <FallbackComponent requiredRoles={requiredRoles} userRole={user.role} />;
      }
      
      return <WrappedComponent {...props} user={user} />;
    }
    
    RequireRoleComponent.displayName = `requireRole(${requiredRoles.join(',')})(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return RequireRoleComponent;
  };
}

// === Permission-Based Authorization HOC ===
function requirePermissions(permissions, options = {}) {
  const {
    requireAll = false, // If true, user must have ALL permissions; if false, ANY permission
    FallbackComponent = DefaultUnauthorizedComponent
  } = options;
  
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  return function(WrappedComponent) {
    function RequirePermissionsComponent(props) {
      const [user, setUser] = useState(AuthService.getCurrentUser());
      
      useEffect(() => {
        const unsubscribe = AuthService.subscribe(setUser);
        return unsubscribe;
      }, []);
      
      if (!user) {
        return <DefaultLoginComponent />;
      }
      
      const hasPermission = requireAll
        ? requiredPermissions.every(permission => AuthService.hasPermission(permission))
        : requiredPermissions.some(permission => AuthService.hasPermission(permission));
      
      if (!hasPermission) {
        return (
          <FallbackComponent
            requiredPermissions={requiredPermissions}
            userPermissions={user.permissions}
            requireAll={requireAll}
          />
        );
      }
      
      return <WrappedComponent {...props} user={user} />;
    }
    
    RequirePermissionsComponent.displayName = `requirePermissions(${requiredPermissions.join(',')})(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return RequirePermissionsComponent;
  };
}

// === Conditional Authentication HOC ===
function withConditionalAuth(condition, options = {}) {
  const { FallbackComponent = DefaultLoginComponent } = options;
  
  return function(WrappedComponent) {
    function ConditionalAuthComponent(props) {
      const [user, setUser] = useState(AuthService.getCurrentUser());
      
      useEffect(() => {
        const unsubscribe = AuthService.subscribe(setUser);
        return unsubscribe;
      }, []);
      
      const shouldRequireAuth = typeof condition === 'function' ? condition(props, user) : condition;
      
      if (shouldRequireAuth && !user) {
        return <FallbackComponent />;
      }
      
      return <WrappedComponent {...props} user={user} />;
    }
    
    ConditionalAuthComponent.displayName = `withConditionalAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return ConditionalAuthComponent;
  };
}

// === HOC Composition Utility ===
function composeAuth(...hocs) {
  return (WrappedComponent) => {
    return hocs.reduceRight((acc, hoc) => hoc(acc), WrappedComponent);
  };
}

// === Default Components ===

function DefaultLoginComponent({ redirectTo }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await AuthService.login(credentials);
      // Redirect would happen here in a real app
      console.log('Login successful, would redirect to:', redirectTo);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login Required</h2>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Username (admin or user)"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password (password)"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Try: admin/password or user/password
      </div>
    </div>
  );
}

function DefaultUnauthorizedComponent({ requiredRoles, requiredPermissions, userRole, userPermissions, requireAll }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
      
      {requiredRoles && (
        <div>
          <p>Required role(s): {requiredRoles.join(', ')}</p>
          <p>Your role: {userRole}</p>
        </div>
      )}
      
      {requiredPermissions && (
        <div>
          <p>Required permission(s): {requiredPermissions.join(', ')}</p>
          <p>Require {requireAll ? 'all' : 'any'} permissions</p>
          <p>Your permissions: {userPermissions?.join(', ') || 'None'}</p>
        </div>
      )}
      
      <button onClick={() => AuthService.logout()}>
        Logout
      </button>
    </div>
  );
}

// === Sample Components ===

// Public component (no authentication required)
function PublicComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Public Page</h2>
      <p>This page is accessible to everyone.</p>
    </div>
  );
}

// Basic protected component
function ProtectedComponent({ user }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Protected Page</h2>
      <p>Welcome, {user.username}!</p>
      <p>Your role: {user.role}</p>
      <p>Your permissions: {user.permissions.join(', ')}</p>
    </div>
  );
}

// Admin-only component
function AdminComponent({ user }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel</h2>
      <p>Welcome to the admin area, {user.username}!</p>
      <ul>
        <li>User Management</li>
        <li>System Settings</li>
        <li>Reports</li>
      </ul>
    </div>
  );
}

// Component requiring specific permissions
function EditComponent({ user }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Content</h2>
      <p>You have write permissions, {user.username}!</p>
      <button>Save Changes</button>
      <button>Delete Content</button>
    </div>
  );
}

// Component with conditional authentication
function ConditionalComponent({ requireAuth, user }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Conditional Access Page</h2>
      <p>Authentication required: {requireAuth ? 'Yes' : 'No'}</p>
      {user ? (
        <p>Logged in as: {user.username}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}

// === Enhanced Components ===

// Component with authentication
const AuthenticatedProtectedComponent = withAuthentication(ProtectedComponent);

// Component requiring authentication
const RequireAuthComponent = requireAuthentication(ProtectedComponent);

// Admin-only component
const AdminOnlyComponent = requireRole('admin')(AdminComponent);

// Component requiring write permissions
const WritePermissionComponent = requirePermissions(['write'])(EditComponent);

// Component requiring multiple permissions
const MultiPermissionComponent = requirePermissions(['read', 'write'], { requireAll: true })(EditComponent);

// Conditionally authenticated component
const ConditionalAuthComponent = withConditionalAuth(
  (props) => props.requireAuth
)(ConditionalComponent);

// Complex composed authentication
const ComplexAuthComponent = composeAuth(
  requireAuthentication,
  requireRole(['admin', 'moderator']),
  requirePermissions(['write', 'delete'])
)(AdminComponent);

// === Navigation Component ===
function Navigation() {
  const [user, setUser] = useState(AuthService.getCurrentUser());
  
  useEffect(() => {
    const unsubscribe = AuthService.subscribe(setUser);
    return unsubscribe;
  }, []);
  
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Auth Demo</h1>
        
        <div>
          {user ? (
            <span>
              Welcome, {user.username} ({user.role}) | 
              <button onClick={() => AuthService.logout()} style={{ marginLeft: '10px' }}>
                Logout
              </button>
            </span>
          ) : (
            <span>Not logged in</span>
          )}
        </div>
      </div>
    </nav>
  );
}

// === Demo Application ===
function AuthenticationHOCDemo() {
  const [currentView, setCurrentView] = useState('public');
  const [conditionalAuth, setConditionalAuth] = useState(false);
  
  const renderComponent = () => {
    switch (currentView) {
      case 'public':
        return <PublicComponent />;
      case 'authenticated':
        return <AuthenticatedProtectedComponent />;
      case 'required-auth':
        return <RequireAuthComponent />;
      case 'admin-only':
        return <AdminOnlyComponent />;
      case 'write-permission':
        return <WritePermissionComponent />;
      case 'multi-permission':
        return <MultiPermissionComponent />;
      case 'conditional':
        return <ConditionalAuthComponent requireAuth={conditionalAuth} />;
      case 'complex':
        return <ComplexAuthComponent />;
      default:
        return <PublicComponent />;
    }
  };
  
  return (
    <div>
      <Navigation />
      
      <div style={{ display: 'flex' }}>
        <aside style={{ width: '250px', padding: '20px', borderRight: '1px solid #ccc' }}>
          <h3>Navigation</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <button onClick={() => setCurrentView('public')}>
                Public Page
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('authenticated')}>
                With Authentication
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('required-auth')}>
                Require Authentication
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('admin-only')}>
                Admin Only
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('write-permission')}>
                Write Permission
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('multi-permission')}>
                Multiple Permissions
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('conditional')}>
                Conditional Auth
              </button>
              {currentView === 'conditional' && (
                <label style={{ display: 'block', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={conditionalAuth}
                    onChange={(e) => setConditionalAuth(e.target.checked)}
                  />
                  Require auth
                </label>
              )}
            </li>
            <li>
              <button onClick={() => setCurrentView('complex')}>
                Complex Auth
              </button>
            </li>
          </ul>
        </aside>
        
        <main style={{ flex: 1 }}>
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}

export default AuthenticationHOCDemo;
export {
  AuthService,
  withAuthentication,
  requireAuthentication,
  requireRole,
  requirePermissions,
  withConditionalAuth,
  composeAuth,
  DefaultLoginComponent,
  DefaultUnauthorizedComponent,
  PublicComponent,
  ProtectedComponent,
  AdminComponent,
  EditComponent,
  ConditionalComponent
};