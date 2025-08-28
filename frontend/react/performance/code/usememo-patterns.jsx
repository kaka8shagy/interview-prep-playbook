/**
 * File: usememo-patterns.jsx
 * Description: useMemo hook patterns for React performance optimization
 */

import React, { useState, useMemo, useCallback } from 'react';

// === Basic useMemo Example ===
function ExpensiveCalculation({ numbers }) {
  // Expensive calculation that should be memoized
  const expensiveValue = useMemo(() => {
    console.log('Calculating expensive value...');
    
    // Simulate expensive computation
    let result = 0;
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < 1000000; j++) {
        result += Math.sqrt(numbers[i] * j);
      }
    }
    
    return result.toFixed(2);
  }, [numbers]); // Only recalculate when numbers change
  
  return (
    <div>
      <h3>Expensive Calculation Result</h3>
      <p>Result: {expensiveValue}</p>
    </div>
  );
}

// === Filtering Large Lists ===
function FilteredList({ items, filterTerm, sortOrder }) {
  // Memoize filtered and sorted results
  const processedItems = useMemo(() => {
    console.log('Processing items...');
    
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(filterTerm.toLowerCase())
    );
    
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return filtered;
  }, [items, filterTerm, sortOrder]);
  
  return (
    <div>
      <h3>Filtered Items ({processedItems.length})</h3>
      <ul>
        {processedItems.map(item => (
          <li key={item.id}>
            {item.name} - {item.category}
          </li>
        ))}
      </ul>
    </div>
  );
}

// === Computed Properties ===
function UserStats({ user }) {
  const stats = useMemo(() => {
    if (!user) return null;
    
    console.log('Computing user stats...');
    
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      age: new Date().getFullYear() - user.birthYear,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      membershipLength: new Date().getFullYear() - user.joinYear,
      isVip: (new Date().getFullYear() - user.joinYear) > 5,
      totalPurchases: user.orders?.reduce((sum, order) => sum + order.amount, 0) || 0
    };
  }, [user]);
  
  if (!stats) return <div>No user data</div>;
  
  return (
    <div>
      <h3>{stats.fullName}</h3>
      <p>Age: {stats.age}</p>
      <p>Initials: {stats.initials}</p>
      <p>Member for: {stats.membershipLength} years</p>
      <p>Status: {stats.isVip ? 'VIP' : 'Regular'}</p>
      <p>Total Purchases: ${stats.totalPurchases}</p>
    </div>
  );
}

// === Complex Object Creation ===
function ChartData({ rawData, chartType, timeRange }) {
  const chartConfig = useMemo(() => {
    console.log('Generating chart config...');
    
    const processedData = rawData
      .filter(point => {
        const date = new Date(point.timestamp);
        const now = new Date();
        const msInDay = 24 * 60 * 60 * 1000;
        
        switch (timeRange) {
          case '7d': return (now - date) <= 7 * msInDay;
          case '30d': return (now - date) <= 30 * msInDay;
          case '90d': return (now - date) <= 90 * msInDay;
          default: return true;
        }
      })
      .map(point => ({
        x: new Date(point.timestamp).toLocaleDateString(),
        y: point.value
      }));
    
    const config = {
      data: processedData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...processedData.map(p => p.y)) * 1.1
          }
        },
        plugins: {
          legend: {
            display: chartType !== 'pie'
          },
          title: {
            display: true,
            text: `Data for ${timeRange}`
          }
        }
      }
    };
    
    return config;
  }, [rawData, chartType, timeRange]);
  
  return (
    <div>
      <h3>Chart Configuration</h3>
      <p>Data points: {chartConfig.data.length}</p>
      <p>Chart type: {chartType}</p>
      <p>Time range: {timeRange}</p>
    </div>
  );
}

// === Avoiding Unnecessary Recalculations ===
function ShoppingCart({ items, discountCode, shippingAddress }) {
  const cartSummary = useMemo(() => {
    console.log('Calculating cart summary...');
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discount = 0;
    if (discountCode) {
      switch (discountCode.toLowerCase()) {
        case 'save10': discount = subtotal * 0.1; break;
        case 'save20': discount = subtotal * 0.2; break;
        case 'firsttime': discount = Math.min(50, subtotal * 0.15); break;
      }
    }
    
    let shipping = 0;
    if (subtotal < 50) {
      shipping = shippingAddress?.international ? 25 : 10;
    }
    
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shipping + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      itemCount: items.reduce((count, item) => count + item.quantity, 0)
    };
  }, [items, discountCode, shippingAddress]);
  
  return (
    <div>
      <h3>Cart Summary</h3>
      <p>Items: {cartSummary.itemCount}</p>
      <p>Subtotal: ${cartSummary.subtotal}</p>
      <p>Discount: -${cartSummary.discount}</p>
      <p>Shipping: ${cartSummary.shipping}</p>
      <p>Tax: ${cartSummary.tax}</p>
      <p><strong>Total: ${cartSummary.total}</strong></p>
    </div>
  );
}

// === Memoizing with Custom Comparison ===
function CustomComparison({ data }) {
  // Custom dependency comparison - only recalculate if data length or first item changes
  const summary = useMemo(() => {
    console.log('Computing summary with custom deps...');
    return {
      count: data.length,
      firstItem: data[0]?.name || 'None',
      lastItem: data[data.length - 1]?.name || 'None'
    };
  }, [data.length, data[0]]); // Custom dependency array
  
  return (
    <div>
      <h3>Custom Comparison</h3>
      <p>Count: {summary.count}</p>
      <p>First: {summary.firstItem}</p>
      <p>Last: {summary.lastItem}</p>
    </div>
  );
}

// === Memoizing Factory Functions ===
function MemoizedFactory({ config }) {
  const createFactory = useMemo(() => {
    console.log('Creating factory function...');
    
    return (type) => {
      switch (type) {
        case 'user':
          return {
            create: (data) => ({ ...data, type: 'user', created: Date.now() }),
            validate: (user) => user.name && user.email
          };
        case 'product':
          return {
            create: (data) => ({ ...data, type: 'product', sku: `PRD-${Date.now()}` }),
            validate: (product) => product.name && product.price > 0
          };
        default:
          return {
            create: (data) => ({ ...data, type: 'unknown' }),
            validate: () => true
          };
      }
    };
  }, [config]);
  
  const userFactory = createFactory('user');
  const productFactory = createFactory('product');
  
  return (
    <div>
      <h3>Factory Pattern</h3>
      <button onClick={() => {
        const user = userFactory.create({ name: 'John', email: 'john@example.com' });
        console.log('Created user:', user);
      }}>
        Create User
      </button>
      <button onClick={() => {
        const product = productFactory.create({ name: 'Widget', price: 29.99 });
        console.log('Created product:', product);
      }}>
        Create Product
      </button>
    </div>
  );
}

// === Anti-patterns to Avoid ===
function AntiPatterns({ items }) {
  // ❌ BAD: New object created every render
  // const config = { sort: true, filter: true };
  
  // ❌ BAD: Memoizing primitive values (unnecessary)
  // const itemCount = useMemo(() => items.length, [items]);
  
  // ❌ BAD: Complex dependency array that defeats the purpose
  // const processed = useMemo(() => processItems(items), [items, Date.now()]);
  
  // ✅ GOOD: Only memoize expensive calculations
  const expensiveResult = useMemo(() => {
    if (!items.length) return { total: 0, average: 0 };
    
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return {
      total,
      average: total / items.length,
      max: Math.max(...items.map(item => item.value)),
      min: Math.min(...items.map(item => item.value))
    };
  }, [items]);
  
  return (
    <div>
      <h3>Proper Memoization</h3>
      <p>Total: {expensiveResult.total}</p>
      <p>Average: {expensiveResult.average.toFixed(2)}</p>
      <p>Range: {expensiveResult.min} - {expensiveResult.max}</p>
    </div>
  );
}

// === Demo Component ===
function UseMemoDemo() {
  const [numbers] = useState([1, 2, 3, 4, 5]);
  const [filterTerm, setFilterTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [discountCode, setDiscountCode] = useState('');
  
  const sampleItems = [
    { id: 1, name: 'Apple iPhone', category: 'Electronics' },
    { id: 2, name: 'Samsung Galaxy', category: 'Electronics' },
    { id: 3, name: 'Nike Shoes', category: 'Fashion' },
    { id: 4, name: 'Adidas Shirt', category: 'Fashion' },
    { id: 5, name: 'Book: React Guide', category: 'Books' }
  ];
  
  const cartItems = [
    { id: 1, name: 'Widget A', price: 25.99, quantity: 2 },
    { id: 2, name: 'Widget B', price: 15.50, quantity: 1 }
  ];
  
  const sampleUser = {
    firstName: 'John',
    lastName: 'Doe',
    birthYear: 1990,
    joinYear: 2018,
    orders: [
      { id: 1, amount: 50 },
      { id: 2, amount: 75 }
    ]
  };
  
  return (
    <div className="demo-container">
      <h1>useMemo Patterns Demo</h1>
      
      <section>
        <ExpensiveCalculation numbers={numbers} />
      </section>
      
      <section>
        <h2>Filtered List</h2>
        <input
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          placeholder="Filter items..."
        />
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="none">No Sort</option>
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
        <FilteredList items={sampleItems} filterTerm={filterTerm} sortOrder={sortOrder} />
      </section>
      
      <section>
        <UserStats user={sampleUser} />
      </section>
      
      <section>
        <h2>Shopping Cart</h2>
        <input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Discount code"
        />
        <ShoppingCart 
          items={cartItems} 
          discountCode={discountCode}
          shippingAddress={{ international: false }}
        />
      </section>
      
      <section>
        <AntiPatterns items={cartItems} />
      </section>
    </div>
  );
}

export default UseMemoDemo;
export {
  ExpensiveCalculation,
  FilteredList,
  UserStats,
  ChartData,
  ShoppingCart,
  CustomComparison,
  MemoizedFactory,
  AntiPatterns
};