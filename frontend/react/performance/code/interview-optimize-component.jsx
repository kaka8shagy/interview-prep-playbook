/**
 * File: interview-optimize-component.jsx
 * Description: Interview question - optimize a poorly performing component
 * Tests understanding of React performance optimization techniques
 */

import React, { useState, useMemo, useCallback, memo } from 'react';

// === PROBLEM: Slow Dashboard Component ===
// This component has multiple performance issues

// ❌ BEFORE: Unoptimized version with performance problems
function SlowDashboard({ userId, theme }) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Problem 1: Expensive calculation on every render
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    averageAge: users.reduce((sum, u) => sum + u.age, 0) / users.length || 0,
    topUsers: users
      .filter(u => u.score > 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  };
  
  // Problem 2: New function created on every render
  const handleUserUpdate = (userId, updates) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };
  
  // Problem 3: New object created on every render
  const tableConfig = {
    sortable: true,
    filterable: true,
    pageSize: 10,
    theme: theme
  };
  
  // Problem 4: Filtering and sorting on every render
  const displayUsers = users
    .filter(user => user.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'score') return b.score - a.score;
      return 0;
    });
  
  return (
    <div className={`dashboard theme-${theme}`}>
      <DashboardStats stats={stats} />
      <UserFilters 
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <UserTable 
        users={displayUsers}
        onUserUpdate={handleUserUpdate}
        config={tableConfig}
      />
      <NotificationPanel notifications={notifications} />
    </div>
  );
}

// ✅ AFTER: Optimized version with all performance issues fixed
function OptimizedDashboard({ userId, theme }) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Fix 1: Memoize expensive calculations
  const stats = useMemo(() => {
    console.log('Recalculating stats...');
    const activeUsers = users.filter(u => u.isActive);
    const totalAge = users.reduce((sum, u) => sum + u.age, 0);
    const topUsers = users
      .filter(u => u.score > 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      averageAge: users.length > 0 ? totalAge / users.length : 0,
      topUsers
    };
  }, [users]);
  
  // Fix 2: Memoize callback functions
  const handleUserUpdate = useCallback((userId, updates) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, []);
  
  // Fix 3: Memoize configuration object
  const tableConfig = useMemo(() => ({
    sortable: true,
    filterable: true,
    pageSize: 10,
    theme: theme
  }), [theme]);
  
  // Fix 4: Memoize filtered and sorted users
  const displayUsers = useMemo(() => {
    console.log('Filtering and sorting users...');
    return users
      .filter(user => user.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'age') return a.age - b.age;
        if (sortBy === 'score') return b.score - a.score;
        return 0;
      });
  }, [users, filter, sortBy]);
  
  return (
    <div className={`dashboard theme-${theme}`}>
      <MemoizedDashboardStats stats={stats} />
      <MemoizedUserFilters 
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <MemoizedUserTable 
        users={displayUsers}
        onUserUpdate={handleUserUpdate}
        config={tableConfig}
      />
      <MemoizedNotificationPanel notifications={notifications} />
    </div>
  );
}

// === Optimized Child Components ===

// Memoized stats component
const MemoizedDashboardStats = memo(function DashboardStats({ stats }) {
  console.log('Rendering DashboardStats');
  
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Users</h3>
        <span className="stat-value">{stats.totalUsers}</span>
      </div>
      <div className="stat-card">
        <h3>Active Users</h3>
        <span className="stat-value">{stats.activeUsers}</span>
      </div>
      <div className="stat-card">
        <h3>Average Age</h3>
        <span className="stat-value">{stats.averageAge.toFixed(1)}</span>
      </div>
      <div className="stat-card">
        <h3>Top Performers</h3>
        <ul>
          {stats.topUsers.map(user => (
            <li key={user.id}>{user.name} ({user.score})</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

// Memoized filters component
const MemoizedUserFilters = memo(function UserFilters({ 
  filter, 
  setFilter, 
  sortBy, 
  setSortBy 
}) {
  console.log('Rendering UserFilters');
  
  return (
    <div className="user-filters">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter users..."
        className="filter-input"
      />
      <select 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        className="sort-select"
      >
        <option value="name">Sort by Name</option>
        <option value="age">Sort by Age</option>
        <option value="score">Sort by Score</option>
      </select>
    </div>
  );
});

// Memoized table component with custom comparison
const MemoizedUserTable = memo(function UserTable({ 
  users, 
  onUserUpdate, 
  config 
}) {
  console.log('Rendering UserTable with', users.length, 'users');
  
  return (
    <div className="user-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <MemoizedUserRow 
              key={user.id}
              user={user}
              onUpdate={onUserUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Individual user row component
const MemoizedUserRow = memo(function UserRow({ user, onUpdate }) {
  console.log(`Rendering user row for ${user.name}`);
  
  const handleToggleActive = useCallback(() => {
    onUpdate(user.id, { isActive: !user.isActive });
  }, [user.id, user.isActive, onUpdate]);
  
  return (
    <tr className={user.isActive ? 'active' : 'inactive'}>
      <td>{user.name}</td>
      <td>{user.age}</td>
      <td>{user.score}</td>
      <td>
        <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <button onClick={handleToggleActive}>
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  );
});

// Memoized notifications panel
const MemoizedNotificationPanel = memo(function NotificationPanel({ notifications }) {
  console.log('Rendering NotificationPanel');
  
  return (
    <div className="notification-panel">
      <h3>Recent Notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map(notification => (
            <li key={notification.id} className={`notification ${notification.type}`}>
              <span className="notification-message">{notification.message}</span>
              <span className="notification-time">{notification.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

// === Performance Comparison Component ===
function PerformanceComparison() {
  const [useOptimized, setUseOptimized] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [theme, setTheme] = useState('light');
  
  // Generate sample data
  const sampleUsers = useMemo(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 50),
      score: Math.floor(Math.random() * 100),
      isActive: Math.random() > 0.3
    })), []
  );
  
  // Track renders
  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
  });
  
  const DashboardComponent = useOptimized ? OptimizedDashboard : SlowDashboard;
  
  return (
    <div className="performance-demo">
      <div className="controls">
        <h2>Performance Comparison</h2>
        <p>Render count: {renderCount}</p>
        
        <label>
          <input
            type="checkbox"
            checked={useOptimized}
            onChange={(e) => setUseOptimized(e.target.checked)}
          />
          Use optimized version
        </label>
        
        <label>
          Theme:
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      
      <div className="dashboard-container">
        <DashboardComponent 
          userId={1} 
          theme={theme}
          users={sampleUsers}
        />
      </div>
    </div>
  );
}

// === Common Optimization Issues ===
function CommonOptimizationIssues() {
  return (
    <div className="optimization-guide">
      <h2>Common Performance Issues & Solutions</h2>
      
      <div className="issue-card">
        <h3>❌ Issue: Inline Objects/Functions</h3>
        <pre>{`
// Bad
<Component config={{ sort: true, filter: true }} />

// Good  
const config = useMemo(() => ({ sort: true, filter: true }), []);
<Component config={config} />
        `}</pre>
      </div>
      
      <div className="issue-card">
        <h3>❌ Issue: Expensive Calculations in Render</h3>
        <pre>{`
// Bad
const expensiveValue = heavyCalculation(data);

// Good
const expensiveValue = useMemo(() => heavyCalculation(data), [data]);
        `}</pre>
      </div>
      
      <div className="issue-card">
        <h3>❌ Issue: Non-memoized Child Components</h3>
        <pre>{`
// Bad
function Parent({ items }) {
  return items.map(item => <Child key={item.id} item={item} />);
}

// Good
const MemoizedChild = memo(Child);
function Parent({ items }) {
  return items.map(item => <MemoizedChild key={item.id} item={item} />);
}
        `}</pre>
      </div>
    </div>
  );
}

// === Demo ===
function OptimizeComponentDemo() {
  return (
    <div className="demo-container">
      <h1>React Component Optimization Demo</h1>
      <PerformanceComparison />
      <CommonOptimizationIssues />
    </div>
  );
}

export default OptimizeComponentDemo;
export {
  SlowDashboard,
  OptimizedDashboard,
  MemoizedDashboardStats,
  MemoizedUserFilters,
  MemoizedUserTable,
  MemoizedUserRow,
  PerformanceComparison
};