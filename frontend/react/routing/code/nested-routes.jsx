/**
 * File: nested-routes.jsx
 * Description: Advanced nested routing patterns in React Router
 * 
 * Learning objectives:
 * - Understand hierarchical route structures with parent/child relationships
 * - Learn Outlet component usage for nested route rendering
 * - Master route inheritance and parameter passing
 * - Implement layout components with nested navigation
 * 
 * Key concepts demonstrated:
 * - Nested route definitions within parent routes
 * - Outlet component for child route rendering
 * - Index routes for default parent route content
 * - Parameter inheritance from parent to child routes
 * - Layout components that wrap child routes
 */

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom';

// Main App component with nested routing structure
function App() {
  return (
    <Router>
      <div className="app">
        <AppNavigation />
        
        <Routes>
          {/* Root level routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Dashboard route with nested children */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Index route renders when path is exactly "/dashboard" */}
            <Route index element={<DashboardHome />} />
            
            {/* Profile section with its own nested routes */}
            <Route path="profile" element={<ProfileSection />}>
              <Route index element={<ProfileOverview />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="security" element={<ProfileSecurity />} />
            </Route>
            
            {/* Analytics section */}
            <Route path="analytics" element={<AnalyticsSection />}>
              <Route index element={<AnalyticsOverview />} />
              <Route path="reports" element={<AnalyticsReports />} />
              <Route path="charts" element={<AnalyticsCharts />} />
            </Route>
            
            {/* Users management with dynamic routing */}
            <Route path="users" element={<UsersSection />}>
              <Route index element={<UsersList />} />
              <Route path=":userId" element={<UserDetails />}>
                <Route index element={<UserOverview />} />
                <Route path="posts" element={<UserPosts />} />
                <Route path="settings" element={<UserSettings />} />
              </Route>
            </Route>
          </Route>
          
          {/* Product catalog with nested categories */}
          <Route path="/catalog" element={<CatalogLayout />}>
            <Route index element={<CatalogHome />} />
            <Route path=":categoryId" element={<CategoryLayout />}>
              <Route index element={<CategoryOverview />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/:productId" element={<ProductDetails />} />
              <Route path="filters" element={<CategoryFilters />} />
            </Route>
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// App-level navigation component
function AppNavigation() {
  return (
    <nav className="app-nav">
      <Link to="/" className="nav-logo">MyApp</Link>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/catalog">Catalog</NavLink>
      </div>
    </nav>
  );
}

// Simple home page
function HomePage() {
  return (
    <div className="page">
      <h1>Welcome to Nested Routing Demo</h1>
      <p>Explore the dashboard and catalog sections to see nested routing in action.</p>
      
      <div className="quick-links">
        <Link to="/dashboard">Go to Dashboard</Link>
        <Link to="/catalog">Browse Catalog</Link>
        <Link to="/dashboard/users/123">View User 123</Link>
      </div>
    </div>
  );
}

// Dashboard Layout: Parent component for all dashboard routes
// Demonstrates layout component pattern with nested navigation
function DashboardLayout() {
  const location = useLocation();
  
  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Current path: {location.pathname}</p>
      </div>
      
      {/* Nested navigation specific to dashboard section */}
      <nav className="dashboard-nav">
        <NavLink 
          to="/dashboard" 
          end // Only active on exact match
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          Overview
        </NavLink>
        <NavLink 
          to="/dashboard/profile"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          Profile
        </NavLink>
        <NavLink 
          to="/dashboard/analytics"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          Analytics
        </NavLink>
        <NavLink 
          to="/dashboard/users"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          Users
        </NavLink>
      </nav>
      
      <div className="dashboard-content">
        {/* Outlet renders the matched child route component */}
        {/* This is where nested route content appears */}
        <Outlet />
      </div>
    </div>
  );
}

// Dashboard home component (index route)
function DashboardHome() {
  return (
    <div className="dashboard-home">
      <h2>Dashboard Overview</h2>
      <p>Welcome to your dashboard. Select a section from the navigation above.</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <span className="stat-number">1,234</span>
        </div>
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <span className="stat-number">89</span>
        </div>
        <div className="stat-card">
          <h3>Revenue Today</h3>
          <span className="stat-number">$5,678</span>
        </div>
      </div>
    </div>
  );
}

// Profile Section: Another level of nested routing
function ProfileSection() {
  return (
    <div className="profile-section">
      <h2>Profile Management</h2>
      
      {/* Sub-navigation for profile section */}
      <nav className="profile-nav">
        <NavLink to="/dashboard/profile" end>Overview</NavLink>
        <NavLink to="/dashboard/profile/settings">Settings</NavLink>
        <NavLink to="/dashboard/profile/security">Security</NavLink>
      </nav>
      
      <div className="profile-content">
        {/* Another Outlet for profile subsection routes */}
        <Outlet />
      </div>
    </div>
  );
}

// Profile subsection components
function ProfileOverview() {
  return (
    <div>
      <h3>Profile Overview</h3>
      <p>Your profile information and recent activity.</p>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div>
      <h3>Profile Settings</h3>
      <p>Manage your profile preferences and account settings.</p>
    </div>
  );
}

function ProfileSecurity() {
  return (
    <div>
      <h3>Security Settings</h3>
      <p>Configure password, two-factor authentication, and security preferences.</p>
    </div>
  );
}

// Analytics section with its own nested structure
function AnalyticsSection() {
  return (
    <div className="analytics-section">
      <h2>Analytics Dashboard</h2>
      
      <nav className="analytics-nav">
        <NavLink to="/dashboard/analytics" end>Overview</NavLink>
        <NavLink to="/dashboard/analytics/reports">Reports</NavLink>
        <NavLink to="/dashboard/analytics/charts">Charts</NavLink>
      </nav>
      
      <div className="analytics-content">
        <Outlet />
      </div>
    </div>
  );
}

function AnalyticsOverview() {
  return <div><h3>Analytics Overview</h3><p>Key metrics and insights.</p></div>;
}

function AnalyticsReports() {
  return <div><h3>Reports</h3><p>Detailed analytics reports.</p></div>;
}

function AnalyticsCharts() {
  return <div><h3>Interactive Charts</h3><p>Visual data representations.</p></div>;
}

// Users section demonstrating parameter inheritance
function UsersSection() {
  return (
    <div className="users-section">
      <h2>User Management</h2>
      <nav className="users-nav">
        <NavLink to="/dashboard/users" end>All Users</NavLink>
      </nav>
      <div className="users-content">
        <Outlet />
      </div>
    </div>
  );
}

function UsersList() {
  const navigate = useNavigate();
  
  // Sample user data
  const users = [
    { id: '123', name: 'John Doe', email: 'john@example.com' },
    { id: '456', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '789', name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  
  return (
    <div className="users-list">
      <h3>All Users</h3>
      <div className="user-cards">
        {users.map(user => (
          <div 
            key={user.id} 
            className="user-card"
            onClick={() => navigate(`/dashboard/users/${user.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <h4>{user.name}</h4>
            <p>{user.email}</p>
            <Link to={`/dashboard/users/${user.id}`}>View Details →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// User details with nested routes for different user views
function UserDetails() {
  const { userId } = useParams();
  
  // In real app, fetch user data based on userId
  const userData = {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    role: 'Member'
  };
  
  return (
    <div className="user-details">
      <div className="user-header">
        <h3>{userData.name}</h3>
        <p>ID: {userData.id} | Role: {userData.role}</p>
      </div>
      
      {/* User-specific navigation */}
      <nav className="user-nav">
        <NavLink to={`/dashboard/users/${userId}`} end>Overview</NavLink>
        <NavLink to={`/dashboard/users/${userId}/posts`}>Posts</NavLink>
        <NavLink to={`/dashboard/users/${userId}/settings`}>Settings</NavLink>
      </nav>
      
      <div className="user-content">
        {/* Parameter automatically inherited by child routes */}
        <Outlet />
      </div>
      
      <Link to="/dashboard/users" className="back-link">
        ← Back to Users List
      </Link>
    </div>
  );
}

// User detail subsection components
// These automatically have access to userId parameter from parent route
function UserOverview() {
  const { userId } = useParams();
  
  return (
    <div>
      <h4>User Overview</h4>
      <p>Detailed information for user {userId}</p>
      <div className="user-stats">
        <p>Posts: 24</p>
        <p>Comments: 156</p>
        <p>Likes: 892</p>
      </div>
    </div>
  );
}

function UserPosts() {
  const { userId } = useParams();
  
  return (
    <div>
      <h4>User Posts</h4>
      <p>All posts by user {userId}</p>
      <div className="posts-list">
        <div className="post">Post 1: React Best Practices</div>
        <div className="post">Post 2: JavaScript Patterns</div>
        <div className="post">Post 3: CSS Techniques</div>
      </div>
    </div>
  );
}

function UserSettings() {
  const { userId } = useParams();
  
  return (
    <div>
      <h4>User Settings</h4>
      <p>Manage settings for user {userId}</p>
      <button>Reset Password</button>
      <button>Suspend Account</button>
    </div>
  );
}

// Catalog section demonstrating deep nesting
function CatalogLayout() {
  return (
    <div className="catalog-layout">
      <h1>Product Catalog</h1>
      <nav className="catalog-nav">
        <NavLink to="/catalog" end>Home</NavLink>
        <NavLink to="/catalog/electronics">Electronics</NavLink>
        <NavLink to="/catalog/clothing">Clothing</NavLink>
        <NavLink to="/catalog/books">Books</NavLink>
      </nav>
      <div className="catalog-content">
        <Outlet />
      </div>
    </div>
  );
}

function CatalogHome() {
  return (
    <div>
      <h2>Browse Our Catalog</h2>
      <p>Select a category to explore products.</p>
    </div>
  );
}

function CategoryLayout() {
  const { categoryId } = useParams();
  
  return (
    <div className="category-layout">
      <h2>Category: {categoryId}</h2>
      
      <nav className="category-nav">
        <NavLink to={`/catalog/${categoryId}`} end>Overview</NavLink>
        <NavLink to={`/catalog/${categoryId}/products`}>Products</NavLink>
        <NavLink to={`/catalog/${categoryId}/filters`}>Filters</NavLink>
      </nav>
      
      <div className="category-content">
        <Outlet />
      </div>
    </div>
  );
}

function CategoryOverview() {
  const { categoryId } = useParams();
  return <div><h3>{categoryId} Overview</h3><p>Category information and highlights.</p></div>;
}

function ProductsList() {
  const { categoryId } = useParams();
  
  return (
    <div>
      <h3>Products in {categoryId}</h3>
      <div className="products-grid">
        <Link to={`/catalog/${categoryId}/products/1`}>Product 1</Link>
        <Link to={`/catalog/${categoryId}/products/2`}>Product 2</Link>
        <Link to={`/catalog/${categoryId}/products/3`}>Product 3</Link>
      </div>
    </div>
  );
}

function ProductDetails() {
  const { categoryId, productId } = useParams();
  
  return (
    <div>
      <h3>Product {productId}</h3>
      <p>Category: {categoryId}</p>
      <p>Detailed product information would go here.</p>
      <Link to={`/catalog/${categoryId}/products`}>← Back to Products</Link>
    </div>
  );
}

function CategoryFilters() {
  const { categoryId } = useParams();
  return <div><h3>Filters for {categoryId}</h3><p>Filter options and controls.</p></div>;
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  );
}

export default App;

// Key Nested Routing Patterns Demonstrated:

// 1. Layout Components:
//    - DashboardLayout wraps all dashboard routes
//    - Provides consistent navigation and styling
//    - Uses Outlet to render child routes

// 2. Index Routes:
//    - Render when parent path matches exactly
//    - Provide default content for sections
//    - Use "index" prop instead of path

// 3. Parameter Inheritance:
//    - Child routes automatically access parent route parameters
//    - No need to pass parameters explicitly
//    - useParams works at any nesting level

// 4. Multi-level Nesting:
//    - Routes can be nested arbitrarily deep
//    - Each level can have its own navigation
//    - Outlet components chain together

// 5. Navigation Patterns:
//    - Use "end" prop on NavLink for exact matching
//    - Build paths by combining parent and child paths
//    - Relative navigation within nested sections

// 6. Best Practices:
//    - Keep route definitions close to their components
//    - Use layout components for consistent UI
//    - Implement breadcrumbs for deep nesting
//    - Consider route data loading patterns