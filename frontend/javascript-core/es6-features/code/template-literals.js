/**
 * File: template-literals.js
 * Description: Template literals and string interpolation
 * Demonstrates advanced template literal features
 */

console.log('=== Basic Template Literals ===');

const name = 'John';
const age = 30;
const city = 'New York';

// Basic string interpolation
const greeting = `Hello, my name is ${name} and I'm ${age} years old.`;
console.log(greeting);

// Multi-line strings
const multiLine = `This is line 1
This is line 2
This is line 3`;
console.log('Multi-line:\n' + multiLine);

// Expression evaluation
const a = 5;
const b = 10;
const mathResult = `The sum of ${a} and ${b} is ${a + b}`;
console.log(mathResult);

console.log('\n=== Advanced Template Literals ===');

// Nested template literals
const user = {
  name: 'Alice',
  preferences: {
    theme: 'dark',
    language: 'en'
  }
};

const config = `User config:
  Name: ${user.name}
  Settings: ${`Theme: ${user.preferences.theme}, Language: ${user.preferences.language}`}`;
console.log(config);

// Conditional content
const isLoggedIn = true;
const status = `You are ${isLoggedIn ? 'logged in' : 'logged out'}`;
console.log(status);

// Function calls in templates
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

const price = 1234.56;
const priceDisplay = `The price is ${formatCurrency(price)}`;
console.log(priceDisplay);

console.log('\n=== HTML Generation ===');

// HTML template generation
function createUserCard(user) {
  return `
    <div class="user-card">
      <h2>${user.name}</h2>
      <p>Email: ${user.email}</p>
      <p>Age: ${user.age}</p>
      ${user.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
    </div>
  `;
}

const userData = {
  name: 'Bob Smith',
  email: 'bob@example.com',
  age: 35,
  isAdmin: true
};

console.log('HTML Card:');
console.log(createUserCard(userData));

// CSS-in-JS styles
function createStyledButton(text, color = 'blue') {
  return `
    <button style="
      background-color: ${color};
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    ">${text}</button>
  `;
}

console.log('\nStyled Button:');
console.log(createStyledButton('Click Me', 'green'));

console.log('\n=== SQL Query Building ===');

// Dynamic SQL query building
function buildSelectQuery(table, columns = ['*'], conditions = {}) {
  const columnList = columns.join(', ');
  const whereClause = Object.keys(conditions).length > 0
    ? `WHERE ${Object.keys(conditions).map(key => `${key} = '${conditions[key]}'`).join(' AND ')}`
    : '';
  
  return `SELECT ${columnList} FROM ${table} ${whereClause}`.trim();
}

const query1 = buildSelectQuery('users', ['id', 'name', 'email']);
const query2 = buildSelectQuery('users', ['*'], { status: 'active', role: 'admin' });

console.log('Query 1:', query1);
console.log('Query 2:', query2);

console.log('\n=== Configuration Templates ===');

// Configuration file generation
function generateConfig(env, database, server) {
  return `
# ${env.toUpperCase()} Configuration
NODE_ENV=${env}

# Database Configuration
DB_HOST=${database.host}
DB_PORT=${database.port}
DB_NAME=${database.name}
DB_USER=${database.user}

# Server Configuration
PORT=${server.port}
API_VERSION=${server.version}
${env === 'production' ? 'ENABLE_LOGGING=true' : 'DEBUG=true'}
  `.trim();
}

const config1 = generateConfig('development', {
  host: 'localhost',
  port: 5432,
  name: 'myapp_dev',
  user: 'developer'
}, {
  port: 3000,
  version: 'v1'
});

console.log('Config file:');
console.log(config1);

console.log('\n=== Email Templates ===');

// Email template generation
function createEmailTemplate(recipient, subject, content, sender = 'noreply@company.com') {
  const currentDate = new Date().toLocaleDateString();
  
  return `
To: ${recipient.email}
From: ${sender}
Subject: ${subject}
Date: ${currentDate}

Dear ${recipient.name},

${content}

Best regards,
The Team

${recipient.isVip ? 'P.S. Thank you for being a VIP customer!' : ''}
---
This email was sent to ${recipient.email}
If you no longer wish to receive these emails, please unsubscribe.
  `.trim();
}

const email = createEmailTemplate(
  { name: 'Jane Doe', email: 'jane@example.com', isVip: true },
  'Welcome to our service!',
  `Thank you for signing up. We're excited to have you on board.
  
  Here are some next steps:
  1. Complete your profile
  2. Explore our features
  3. Join our community`
);

console.log('Email:');
console.log(email);

console.log('\n=== JSON Generation ===');

// Dynamic JSON generation
function createApiResponse(data, success = true, message = '') {
  const timestamp = new Date().toISOString();
  
  return `{
  "success": ${success},
  "timestamp": "${timestamp}",
  "data": ${JSON.stringify(data, null, 2).split('\n').map((line, i) => 
    i === 0 ? line : `  ${line}`).join('\n')},
  ${message ? `"message": "${message}",` : ''}
  "meta": {
    "version": "1.0",
    "requestId": "${Math.random().toString(36).substr(2, 9)}"
  }
}`;
}

const apiResponse = createApiResponse(
  { users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] },
  true,
  'Users retrieved successfully'
);

console.log('API Response:');
console.log(apiResponse);

console.log('\n=== Interview Challenges ===');

// Challenge 1: Create a logger template
function createLogger(level = 'INFO') {
  const timestamp = () => new Date().toISOString();
  
  return (message, ...data) => {
    const dataStr = data.length > 0 ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp()}] ${level}: ${message}${dataStr}`;
  };
}

const logger = createLogger('DEBUG');
console.log(logger('User login attempt', { userId: 123, ip: '192.168.1.1' }));

// Challenge 2: URL builder
function buildUrl(baseUrl, path, queryParams = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = Object.keys(queryParams).length > 0
    ? `?${Object.entries(queryParams).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`
    : '';
  
  return `${baseUrl}${cleanPath}${queryString}`;
}

const url1 = buildUrl('https://api.example.com', '/users', { page: 1, limit: 10, filter: 'active users' });
console.log('Built URL:', url1);

// Challenge 3: Code generator
function generateFunction(name, params, body) {
  const paramList = params.join(', ');
  const indentedBody = body.split('\n').map(line => `  ${line}`).join('\n');
  
  return `function ${name}(${paramList}) {
${indentedBody}
}`;
}

const generatedFunc = generateFunction(
  'calculateTax',
  ['amount', 'rate'],
  'const tax = amount * rate;\nreturn tax;'
);

console.log('\nGenerated function:');
console.log(generatedFunc);

module.exports = {
  createUserCard,
  createStyledButton,
  buildSelectQuery,
  generateConfig,
  createEmailTemplate,
  createApiResponse,
  createLogger,
  buildUrl,
  generateFunction
};