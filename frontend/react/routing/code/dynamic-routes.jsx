/**
 * File: dynamic-routes.jsx
 * Description: Dynamic routing patterns with parameters and query strings
 * 
 * Learning objectives:
 * - Master route parameters and query string handling
 * - Implement dynamic route generation based on data
 * - Handle URL state synchronization with component state
 * - Create search and filtering interfaces with URL persistence
 * 
 * Key concepts demonstrated:
 * - useParams for accessing route parameters
 * - useSearchParams for query string management  
 * - Dynamic route generation from API data
 * - URL state synchronization patterns
 * - Search and pagination with URL persistence
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';

// Mock data for demonstration
const MOCK_USERS = [
  { id: '1', name: 'Alice Johnson', role: 'admin', department: 'engineering', active: true },
  { id: '2', name: 'Bob Smith', role: 'user', department: 'marketing', active: true },
  { id: '3', name: 'Carol Davis', role: 'moderator', department: 'engineering', active: false },
  { id: '4', name: 'David Wilson', role: 'user', department: 'sales', active: true },
  { id: '5', name: 'Eve Brown', role: 'admin', department: 'marketing', active: true },
  { id: '6', name: 'Frank Miller', role: 'user', department: 'engineering', active: false }
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'Laptop Pro', category: 'electronics', price: 1299, brand: 'TechCorp' },
  { id: '2', name: 'Wireless Mouse', category: 'electronics', price: 29, brand: 'TechCorp' },
  { id: '3', name: 'Office Chair', category: 'furniture', price: 299, brand: 'ComfortCo' },
  { id: '4', name: 'Desk Lamp', category: 'furniture', price: 89, brand: 'LightMax' },
  { id: '5', name: 'Smartphone', category: 'electronics', price: 799, brand: 'MobileTech' },
  { id: '6', name: 'Coffee Maker', category: 'appliances', price: 199, brand: 'BrewMaster' }
];

const MOCK_POSTS = [
  { id: '1', title: 'React Best Practices', slug: 'react-best-practices', authorId: '1', tags: ['react', 'javascript'] },
  { id: '2', title: 'CSS Grid Layout Guide', slug: 'css-grid-layout-guide', authorId: '2', tags: ['css', 'layout'] },
  { id: '3', title: 'Node.js Performance Tips', slug: 'nodejs-performance-tips', authorId: '3', tags: ['nodejs', 'performance'] },
  { id: '4', title: 'Database Design Patterns', slug: 'database-design-patterns', authorId: '1', tags: ['database', 'architecture'] }
];

// Main App component with dynamic routing
function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        
        <main className="main-content">
          <Routes>
            {/* Static routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Users section with search and filtering */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
            
            {/* Products with advanced filtering and pagination */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            
            {/* Blog with slug-based routing */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            
            {/* Search results with query parameters */}
            <Route path="/search" element={<SearchPage />} />
            
            {/* Dynamic category pages */}
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            
            {/* Redirect examples */}
            <Route path="/user/:userId" element={<Navigate to="/users/:userId" replace />} />
            <Route path="/old-blog/:id" element={<BlogRedirect />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Navigation component
function Navigation() {
  return (
    <nav className="navigation">
      <Link to="/" className="nav-logo">Dynamic Routes Demo</Link>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
        <Link to="/products">Products</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/search">Search</Link>
      </div>
    </nav>
  );
}

// Home page with dynamic link examples
function HomePage() {
  return (
    <div className="home-page">
      <h1>Dynamic Routing Examples</h1>
      
      <div className="examples-grid">
        <div className="example-card">
          <h3>User Profiles</h3>
          <p>Dynamic user pages with parameters</p>
          <div className="example-links">
            <Link to="/users/1">Alice Johnson</Link>
            <Link to="/users/2">Bob Smith</Link>
            <Link to="/users/3">Carol Davis</Link>
          </div>
        </div>
        
        <div className="example-card">
          <h3>Product Catalog</h3>
          <p>Products with filtering and search</p>
          <div className="example-links">
            <Link to="/products?category=electronics">Electronics</Link>
            <Link to="/products?brand=TechCorp&sort=price">TechCorp Products</Link>
            <Link to="/products/1">Laptop Pro Details</Link>
          </div>
        </div>
        
        <div className="example-card">
          <h3>Blog Posts</h3>
          <p>SEO-friendly slug-based URLs</p>
          <div className="example-links">
            <Link to="/blog/react-best-practices">React Best Practices</Link>
            <Link to="/blog/css-grid-layout-guide">CSS Grid Guide</Link>
            <Link to="/blog?tag=javascript">JavaScript Posts</Link>
          </div>
        </div>
        
        <div className="example-card">
          <h3>Search Interface</h3>
          <p>URL-persisted search and filters</p>
          <div className="example-links">
            <Link to="/search?q=react">Search for "react"</Link>
            <Link to="/search?q=css&type=post">CSS Posts</Link>
            <Link to="/search?category=electronics">Electronics Search</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users page with search and filtering via URL parameters
function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract current filter values from URL
  const currentSearch = searchParams.get('search') || '';
  const currentRole = searchParams.get('role') || '';
  const currentDepartment = searchParams.get('department') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  
  // Filter users based on URL parameters
  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(user => {
      const matchesSearch = !currentSearch || 
        user.name.toLowerCase().includes(currentSearch.toLowerCase());
      const matchesRole = !currentRole || user.role === currentRole;
      const matchesDepartment = !currentDepartment || user.department === currentDepartment;
      const matchesStatus = !currentStatus || 
        (currentStatus === 'active' ? user.active : !user.active);
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  }, [currentSearch, currentRole, currentDepartment, currentStatus]);
  
  // Pagination logic
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Update URL parameters when filters change
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    
    setSearchParams(newParams);
  };
  
  // Handle search input with debouncing
  const [searchInput, setSearchInput] = useState(currentSearch);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', searchInput);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  return (
    <div className="users-page">
      <h1>Users Directory</h1>
      
      {/* Filter controls that update URL */}
      <div className="filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users..."
          />
        </div>
        
        <div className="filter-group">
          <label>Role:</label>
          <select
            value={currentRole}
            onChange={(e) => updateFilter('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Department:</label>
          <select
            value={currentDepartment}
            onChange={(e) => updateFilter('department', e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <button 
          className="clear-filters"
          onClick={() => navigate('/users')}
        >
          Clear All Filters
        </button>
      </div>
      
      {/* Results summary */}
      <div className="results-summary">
        <p>
          Showing {paginatedUsers.length} of {filteredUsers.length} users
          {currentSearch && ` matching "${currentSearch}"`}
        </p>
      </div>
      
      {/* User list */}
      <div className="users-list">
        {paginatedUsers.map(user => (
          <div key={user.id} className="user-card">
            <h3>
              <Link to={`/users/${user.id}`}>{user.name}</Link>
            </h3>
            <p>Role: {user.role}</p>
            <p>Department: {user.department}</p>
            <p>Status: {user.active ? 'Active' : 'Inactive'}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => updateFilter('page', currentPage - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              className={currentPage === pageNum ? 'active' : ''}
              onClick={() => updateFilter('page', pageNum)}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => updateFilter('page', currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Share current filter state */}
      <div className="share-filters">
        <h3>Share These Filters:</h3>
        <input
          type="text"
          value={window.location.href}
          readOnly
          onClick={(e) => e.target.select()}
        />
        <p>This URL preserves all current filters and can be bookmarked or shared!</p>
      </div>
    </div>
  );
}

// User detail page with parameter handling
function UserDetailPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Find user by ID
  const user = MOCK_USERS.find(u => u.id === userId);
  
  // Handle tab selection via URL parameter
  const currentTab = searchParams.get('tab') || 'profile';
  
  const setTab = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'profile') {
      newParams.delete('tab'); // Remove default tab from URL
    } else {
      newParams.set('tab', tab);
    }
    navigate(`/users/${userId}?${newParams.toString()}`, { replace: true });
  };
  
  if (!user) {
    return (
      <div className="user-not-found">
        <h2>User Not Found</h2>
        <p>User with ID "{userId}" doesn't exist.</p>
        <Link to="/users">← Back to Users</Link>
      </div>
    );
  }
  
  return (
    <div className="user-detail-page">
      <div className="user-header">
        <h1>{user.name}</h1>
        <p>ID: {user.id}</p>
      </div>
      
      {/* Tab navigation with URL state */}
      <div className="tab-navigation">
        <button
          className={currentTab === 'profile' ? 'active' : ''}
          onClick={() => setTab('profile')}
        >
          Profile
        </button>
        <button
          className={currentTab === 'activity' ? 'active' : ''}
          onClick={() => setTab('activity')}
        >
          Activity
        </button>
        <button
          className={currentTab === 'settings' ? 'active' : ''}
          onClick={() => setTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Tab content based on URL parameter */}
      <div className="tab-content">
        {currentTab === 'profile' && (
          <div className="profile-tab">
            <h2>Profile Information</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Department:</strong> {user.department}</p>
            <p><strong>Status:</strong> {user.active ? 'Active' : 'Inactive'}</p>
          </div>
        )}
        
        {currentTab === 'activity' && (
          <div className="activity-tab">
            <h2>Recent Activity</h2>
            <p>Activity log for {user.name}...</p>
            <ul>
              <li>Logged in at 2023-12-01 09:00</li>
              <li>Updated profile at 2023-11-30 14:30</li>
              <li>Created post at 2023-11-29 16:45</li>
            </ul>
          </div>
        )}
        
        {currentTab === 'settings' && (
          <div className="settings-tab">
            <h2>User Settings</h2>
            <p>Settings management for {user.name}...</p>
            <button>Change Password</button>
            <button>Update Permissions</button>
          </div>
        )}
      </div>
      
      <Link to="/users" className="back-link">
        ← Back to Users
      </Link>
    </div>
  );
}

// Products page with advanced filtering and sorting
function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract parameters
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = parseInt(searchParams.get('minPrice')) || 0;
  const maxPrice = parseInt(searchParams.get('maxPrice')) || 9999;
  const sortBy = searchParams.get('sort') || 'name';
  const sortOrder = searchParams.get('order') || 'asc';
  
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = MOCK_PRODUCTS.filter(product => {
      return (!category || product.category === category) &&
             (!brand || product.brand === brand) &&
             (product.price >= minPrice && product.price <= maxPrice);
    });
    
    // Sort products
    products.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
    
    return products;
  }, [category, brand, minPrice, maxPrice, sortBy, sortOrder]);
  
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === 0) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };
  
  return (
    <div className="products-page">
      <h1>Product Catalog</h1>
      
      {/* Advanced filtering controls */}
      <div className="product-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={category}
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="appliances">Appliances</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Brand:</label>
            <select
              value={brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
            >
              <option value="">All Brands</option>
              <option value="TechCorp">TechCorp</option>
              <option value="ComfortCo">ComfortCo</option>
              <option value="LightMax">LightMax</option>
              <option value="MobileTech">MobileTech</option>
              <option value="BrewMaster">BrewMaster</option>
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Min Price:</label>
            <input
              type="number"
              value={minPrice || ''}
              onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          
          <div className="filter-group">
            <label>Max Price:</label>
            <input
              type="number"
              value={maxPrice === 9999 ? '' : maxPrice}
              onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 9999)}
              placeholder="Any"
            />
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="brand">Brand</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => updateFilter('order', e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="results-info">
        <p>{filteredProducts.length} products found</p>
      </div>
      
      {/* Product grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <h3>
              <Link to={`/products/${product.id}`}>{product.name}</Link>
            </h3>
            <p className="product-price">${product.price}</p>
            <p className="product-brand">{product.brand}</p>
            <p className="product-category">{product.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product detail page
function ProductDetailPage() {
  const { productId } = useParams();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>Product with ID "{productId}" doesn't exist.</p>
        <Link to="/products">← Back to Products</Link>
      </div>
    );
  }
  
  return (
    <div className="product-detail-page">
      <h1>{product.name}</h1>
      <div className="product-details">
        <p><strong>Price:</strong> ${product.price}</p>
        <p><strong>Brand:</strong> {product.brand}</p>
        <p><strong>Category:</strong> {product.category}</p>
      </div>
      
      <div className="product-actions">
        <button>Add to Cart</button>
        <Link to={`/products?category=${product.category}`}>
          More {product.category}
        </Link>
        <Link to={`/products?brand=${product.brand}`}>
          More from {product.brand}
        </Link>
      </div>
      
      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>
    </div>
  );
}

// Blog page with tag filtering
function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag') || '';
  
  const filteredPosts = selectedTag
    ? MOCK_POSTS.filter(post => post.tags.includes(selectedTag))
    : MOCK_POSTS;
  
  // Get all unique tags
  const allTags = [...new Set(MOCK_POSTS.flatMap(post => post.tags))];
  
  return (
    <div className="blog-page">
      <h1>Blog Posts</h1>
      
      {/* Tag filters */}
      <div className="tag-filters">
        <button
          className={!selectedTag ? 'active' : ''}
          onClick={() => setSearchParams({})}
        >
          All Posts
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={selectedTag === tag ? 'active' : ''}
            onClick={() => setSearchParams({ tag })}
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* Posts list */}
      <div className="posts-list">
        {filteredPosts.map(post => (
          <article key={post.id} className="post-card">
            <h2>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <div className="post-meta">
              <p>Author ID: {post.authorId}</p>
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">
                    <Link to={`/blog?tag=${tag}`}>#{tag}</Link>
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// Blog post detail with slug-based routing
function BlogPostPage() {
  const { slug } = useParams();
  const post = MOCK_POSTS.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="post-not-found">
        <h2>Post Not Found</h2>
        <p>No post found with slug "{slug}"</p>
        <Link to="/blog">← Back to Blog</Link>
      </div>
    );
  }
  
  return (
    <div className="blog-post-page">
      <article>
        <header>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <p>Author ID: {post.authorId}</p>
            <div className="post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="tag">
                  <Link to={`/blog?tag=${tag}`}>#{tag}</Link>
                </span>
              ))}
            </div>
          </div>
        </header>
        
        <div className="post-content">
          <p>This is the full content of the blog post about {post.title}.</p>
          <p>In a real application, this would contain the complete article content.</p>
        </div>
      </article>
      
      <div className="post-navigation">
        <Link to="/blog">← Back to Blog</Link>
        <Link to={`/users/${post.authorId}`}>View Author Profile</Link>
      </div>
    </div>
  );
}

// Global search page with multiple result types
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  
  // Search across different data types
  const searchResults = useMemo(() => {
    if (!query) return { users: [], products: [], posts: [] };
    
    const lowerQuery = query.toLowerCase();
    
    const users = MOCK_USERS.filter(user =>
      user.name.toLowerCase().includes(lowerQuery)
    );
    
    const products = MOCK_PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery)
    );
    
    const posts = MOCK_POSTS.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    
    return { users, products, posts };
  }, [query]);
  
  const updateSearch = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  
  return (
    <div className="search-page">
      <h1>Search</h1>
      
      {/* Search form */}
      <div className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => updateSearch('q', e.target.value)}
          placeholder="Search users, products, posts..."
          autoFocus
        />
        
        <select
          value={type}
          onChange={(e) => updateSearch('type', e.target.value)}
        >
          <option value="all">All Results</option>
          <option value="users">Users Only</option>
          <option value="products">Products Only</option>
          <option value="posts">Posts Only</option>
        </select>
      </div>
      
      {query && (
        <div className="search-results">
          <h2>Results for "{query}"</h2>
          
          {/* Users results */}
          {(type === 'all' || type === 'users') && searchResults.users.length > 0 && (
            <section className="results-section">
              <h3>Users ({searchResults.users.length})</h3>
              {searchResults.users.map(user => (
                <div key={user.id} className="result-item">
                  <Link to={`/users/${user.id}`}>{user.name}</Link>
                  <p>{user.role} in {user.department}</p>
                </div>
              ))}
            </section>
          )}
          
          {/* Products results */}
          {(type === 'all' || type === 'products') && searchResults.products.length > 0 && (
            <section className="results-section">
              <h3>Products ({searchResults.products.length})</h3>
              {searchResults.products.map(product => (
                <div key={product.id} className="result-item">
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                  <p>${product.price} - {product.brand}</p>
                </div>
              ))}
            </section>
          )}
          
          {/* Posts results */}
          {(type === 'all' || type === 'posts') && searchResults.posts.length > 0 && (
            <section className="results-section">
              <h3>Posts ({searchResults.posts.length})</h3>
              {searchResults.posts.map(post => (
                <div key={post.id} className="result-item">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  <p>Tags: {post.tags.join(', ')}</p>
                </div>
              ))}
            </section>
          )}
          
          {/* No results */}
          {Object.values(searchResults).every(arr => arr.length === 0) && (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <p>Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      )}
      
      {!query && (
        <div className="search-suggestions">
          <h2>Popular Searches</h2>
          <div className="suggestion-links">
            <Link to="/search?q=react">React</Link>
            <Link to="/search?q=laptop">Laptop</Link>
            <Link to="/search?q=admin">Admin Users</Link>
            <Link to="/search?q=css&type=posts">CSS Posts</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Dynamic category pages
function CategoryPage() {
  const { categoryName } = useParams();
  
  // Find products in this category
  const categoryProducts = MOCK_PRODUCTS.filter(
    product => product.category === categoryName
  );
  
  if (categoryProducts.length === 0) {
    return (
      <div className="category-not-found">
        <h2>Category Not Found</h2>
        <p>No products found in category "{categoryName}"</p>
        <Link to="/products">← Browse All Products</Link>
      </div>
    );
  }
  
  return (
    <div className="category-page">
      <h1>{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Category</h1>
      
      <div className="category-products">
        {categoryProducts.map(product => (
          <div key={product.id} className="product-card">
            <h3>
              <Link to={`/products/${product.id}`}>{product.name}</Link>
            </h3>
            <p>${product.price}</p>
            <p>{product.brand}</p>
          </div>
        ))}
      </div>
      
      <div className="category-actions">
        <Link to="/products">View All Products</Link>
        <Link to={`/products?category=${categoryName}`}>
          Filter Products by {categoryName}
        </Link>
      </div>
    </div>
  );
}

// Blog redirect component for old URLs
function BlogRedirect() {
  const { id } = useParams();
  
  // Find post by ID and redirect to slug-based URL
  const post = MOCK_POSTS.find(p => p.id === id);
  
  if (post) {
    return <Navigate to={`/blog/${post.slug}`} replace />;
  }
  
  return <Navigate to="/blog" replace />;
}

// 404 page
function NotFoundPage() {
  const location = useLocation();
  
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page "{location.pathname}" doesn't exist.</p>
      
      <div className="suggestions">
        <h2>Try these instead:</h2>
        <Link to="/">Home</Link>
        <Link to="/users">Browse Users</Link>
        <Link to="/products">Browse Products</Link>
        <Link to="/blog">Read Blog</Link>
        <Link to="/search">Search</Link>
      </div>
    </div>
  );
}

export default App;

// Key Dynamic Routing Patterns Demonstrated:

// 1. URL Parameter Management:
//    - useParams for route segments
//    - useSearchParams for query strings
//    - Automatic URL updates when state changes

// 2. State-URL Synchronization:
//    - Filter state persisted in URL
//    - Bookmarkable search results
//    - Browser back/forward support

// 3. Complex Filtering:
//    - Multiple simultaneous filters
//    - Debounced search input
//    - Pagination with preserved filters

// 4. SEO-Friendly URLs:
//    - Slug-based blog post URLs
//    - Category-based product URLs
//    - Meaningful parameter names

// 5. Dynamic Route Generation:
//    - Routes created from data
//    - Conditional route rendering
//    - Redirect handling for old URLs

// 6. Performance Considerations:
//    - useMemo for expensive filtering/sorting
//    - Debounced search to reduce updates
//    - Efficient parameter parsing

// Best Practices for Dynamic Routing:
// - Always validate route parameters
// - Handle missing/invalid data gracefully
// - Use meaningful URL structures
// - Implement proper loading states
// - Consider SEO implications
// - Test edge cases thoroughly