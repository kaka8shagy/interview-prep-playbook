/**
 * File: basic-routing.jsx
 * Description: Fundamental React Router setup demonstrating core routing concepts
 * 
 * Learning objectives:
 * - Understand declarative routing with React Router components
 * - Learn route definition patterns and component integration
 * - See basic navigation patterns with Link components
 * - Handle route parameters and query strings
 * 
 * Key concepts demonstrated:
 * - BrowserRouter as application wrapper
 * - Routes and Route component organization
 * - Link navigation and NavLink active states
 * - useParams for route parameter access
 */

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useParams,
  useLocation
} from 'react-router-dom';

// Root App component that sets up routing context
// BrowserRouter provides HTML5 history API integration
function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation component demonstrates Link usage */}
        <Navigation />
        
        {/* Routes container defines all application routes */}
        <main className="main-content">
          <Routes>
            {/* Index route renders when path exactly matches "/" */}
            <Route path="/" element={<HomePage />} />
            
            {/* Static routes for fixed application sections */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Dynamic route with parameter using colon syntax */}
            {/* :userId creates a parameter accessible via useParams */}
            <Route path="/users/:userId" element={<UserProfile />} />
            
            {/* Optional parameters using question mark syntax */}
            <Route path="/products/:category/:id?" element={<ProductPage />} />
            
            {/* Wildcard route catches all unmatched paths */}
            {/* This should always be last in route definitions */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Navigation component demonstrates different link types
// Shows active state management and navigation patterns
function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        {/* Link to="/" provides simple navigation without page reload */}
        <Link to="/">My App</Link>
      </div>
      
      <ul className="nav-links">
        <li>
          {/* NavLink provides automatic active class management */}
          {/* className callback receives isActive state */}
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            end // "end" prop ensures active only on exact match
          >
            Home
          </NavLink>
        </li>
        
        <li>
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            About
          </NavLink>
        </li>
        
        <li>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Contact
          </NavLink>
        </li>
        
        <li>
          {/* Example link with parameters pre-filled */}
          <Link to="/users/123" className="nav-link">
            User Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// Simple home page component
function HomePage() {
  return (
    <div className="page">
      <h1>Welcome to Our Application</h1>
      <p>This is the home page demonstrating basic React Router setup.</p>
      
      {/* Internal navigation links within page content */}
      <div className="quick-links">
        <h3>Quick Navigation:</h3>
        <Link to="/about">Learn About Us</Link>
        <Link to="/users/456">View Sample User</Link>
        <Link to="/products/electronics">Browse Electronics</Link>
      </div>
    </div>
  );
}

// About page with location hook demonstration
function AboutPage() {
  // useLocation provides access to current location object
  // Useful for debugging and conditional rendering
  const location = useLocation();
  
  return (
    <div className="page">
      <h1>About Us</h1>
      <p>Learn more about our company and mission.</p>
      
      {/* Display current location information for educational purposes */}
      <div className="debug-info">
        <h4>Current Location Info:</h4>
        <p><strong>Pathname:</strong> {location.pathname}</p>
        <p><strong>Search:</strong> {location.search || 'None'}</p>
        <p><strong>Hash:</strong> {location.hash || 'None'}</p>
      </div>
    </div>
  );
}

// Contact page demonstrating simple static route
function ContactPage() {
  return (
    <div className="page">
      <h1>Contact Information</h1>
      <div className="contact-details">
        <p>Email: contact@example.com</p>
        <p>Phone: (555) 123-4567</p>
        <p>Address: 123 Main Street, City, State 12345</p>
      </div>
      
      {/* Example of navigation back to home */}
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
}

// User profile component demonstrates useParams hook
function UserProfile() {
  // useParams extracts route parameters from current URL
  // Parameter names match those defined in Route path prop
  const { userId } = useParams();
  const location = useLocation();
  
  // In real application, you'd fetch user data based on userId
  // Here we simulate user data for demonstration
  const userData = {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    joinDate: '2023-01-15'
  };
  
  return (
    <div className="page">
      <h1>User Profile</h1>
      
      {/* Display user information using extracted parameter */}
      <div className="user-info">
        <h2>{userData.name}</h2>
        <p><strong>User ID:</strong> {userData.id}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Member Since:</strong> {userData.joinDate}</p>
      </div>
      
      {/* Show query parameters if they exist */}
      {location.search && (
        <div className="query-params">
          <h3>URL Parameters:</h3>
          <p>{location.search}</p>
        </div>
      )}
      
      {/* Navigation examples with different user IDs */}
      <div className="related-users">
        <h3>Other Users:</h3>
        <Link to="/users/100">User 100</Link>
        <Link to="/users/200">User 200</Link>
        <Link to="/users/300?tab=settings">User 300 (Settings)</Link>
      </div>
    </div>
  );
}

// Product page demonstrating multiple parameters and optional parameters
function ProductPage() {
  const { category, id } = useParams();
  
  return (
    <div className="page">
      <h1>Product Page</h1>
      
      <div className="product-info">
        <p><strong>Category:</strong> {category}</p>
        {/* id parameter is optional (defined with ?), so check if exists */}
        {id ? (
          <p><strong>Product ID:</strong> {id}</p>
        ) : (
          <p>Showing all products in {category} category</p>
        )}
      </div>
      
      {/* Navigation examples with different parameter combinations */}
      <div className="navigation-examples">
        <h3>Browse Categories:</h3>
        <Link to="/products/electronics">Electronics</Link>
        <Link to="/products/clothing">Clothing</Link>
        <Link to="/products/books/123">Book #123</Link>
        <Link to="/products/electronics/456">Electronics #456</Link>
      </div>
    </div>
  );
}

// 404 Not Found component for unmatched routes
function NotFoundPage() {
  const location = useLocation();
  
  return (
    <div className="page not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page "{location.pathname}" could not be found.</p>
      
      {/* Helpful navigation options for lost users */}
      <div className="help-links">
        <Link to="/" className="back-home">
          ← Go Home
        </Link>
        <Link to="/about">
          Learn About Us
        </Link>
      </div>
    </div>
  );
}

// Export the main App component for use in index.js
export default App;

// Example usage patterns and best practices:

// 1. Router Placement:
//    - Place BrowserRouter at the root of your application
//    - All routing components must be inside Router context

// 2. Route Organization:
//    - Order routes from specific to general
//    - Place wildcard (*) routes last
//    - Group related routes together

// 3. Link Best Practices:
//    - Use Link for internal navigation to prevent page reloads
//    - Use NavLink for navigation menus that need active states
//    - Use regular <a> tags for external links

// 4. Parameter Handling:
//    - Access route parameters with useParams hook
//    - Check for optional parameters before using
//    - Validate parameters for security and UX

// 5. Performance Considerations:
//    - This example loads all components immediately
//    - In production, consider code splitting with React.lazy()
//    - Preload critical routes for better perceived performance