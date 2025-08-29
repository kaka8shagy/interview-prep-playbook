/**
 * File: modern-features.js
 * Topic: ES2016+ Modern JavaScript Features and Advanced Patterns
 * 
 * This file covers features introduced from ES2016 onwards, focusing on
 * practical applications and interview-relevant patterns. Each feature
 * is explained with real-world context and implementation details.
 * Focus: Understanding the evolution and practical usage of modern JavaScript
 */

// ============================================================================
// ES2016 (ES7) - FOUNDATIONAL MODERN FEATURES
// ============================================================================

/**
 * Array.prototype.includes() - Better Membership Testing
 * 
 * Before ES2016, checking array membership required indexOf() which had limitations:
 * - indexOf() returns -1 for missing items (truthy check needed)
 * - indexOf() uses strict equality, can't find NaN properly
 * - Less readable than a boolean return value
 * 
 * includes() solves these issues and handles edge cases better
 */

const searchTerms = ['javascript', 'react', 'nodejs', NaN, undefined];

// Old approach with indexOf() - multiple issues
function hasTermOld(term) {
    // Problem 1: Requires comparison with -1
    // Problem 2: Can't find NaN (NaN !== NaN)
    return searchTerms.indexOf(term) !== -1;
}

// Modern approach with includes() - cleaner and more robust
function hasTerm(term) {
    // Benefits:
    // - Direct boolean return value
    // - Proper NaN handling using SameValueZero comparison
    // - More readable and expressive
    return searchTerms.includes(term);
}

console.log('Finding "react":', hasTerm('react')); // true
console.log('Finding NaN:', hasTerm(NaN)); // true (includes can find NaN!)
console.log('Old method with NaN:', hasTermOld(NaN)); // false (indexOf fails with NaN)

/**
 * Exponentiation Operator (**) - Mathematical Power Operations
 * 
 * Replaces Math.pow() with cleaner syntax and better performance.
 * Particularly useful in mathematical calculations, data processing,
 * and algorithm implementations where power operations are common.
 */

// Calculating compound interest with exponential growth
function calculateCompoundInterest(principal, rate, time, compoundFrequency) {
    // Formula: A = P(1 + r/n)^(nt)
    // Using ** operator is more readable than Math.pow()
    const amount = principal * (1 + rate / compoundFrequency) ** (compoundFrequency * time);
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
}

const investment = calculateCompoundInterest(1000, 0.05, 10, 4); // $1000 at 5% for 10 years, quarterly
console.log('Investment after 10 years:', investment);

// Powers of 2 for binary operations (common in algorithms)
const binaryPowers = Array.from({ length: 10 }, (_, i) => 2 ** i);
console.log('Powers of 2:', binaryPowers); // [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]

// ============================================================================
// ES2017 (ES8) - ASYNC/AWAIT AND OBJECT ENHANCEMENTS
// ============================================================================

/**
 * Object.values() and Object.entries() - Enhanced Object Processing
 * 
 * These methods complete the trio with Object.keys(), providing comprehensive
 * ways to extract data from objects. Essential for functional programming
 * patterns and data transformation workflows.
 */

const userStats = {
    totalPosts: 125,
    totalComments: 340,
    totalLikes: 892,
    totalShares: 67,
    joinDate: '2022-03-15'
};

// Object.values() - Extract all values for processing
const numericStats = Object.values(userStats)
    .filter(value => typeof value === 'number') // Filter only numeric values
    .reduce((sum, current) => sum + current, 0); // Sum all numeric stats

console.log('Total numeric activity:', numericStats);

// Object.entries() - Transform object to array of [key, value] pairs
const statsReport = Object.entries(userStats)
    .filter(([key, value]) => typeof value === 'number') // Only numeric stats
    .map(([key, value]) => {
        // Convert camelCase to readable format
        const readableKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        return `${readableKey}: ${value.toLocaleString()}`; // Add number formatting
    })
    .join(', ');

console.log('User activity report:', statsReport);

/**
 * String Padding Methods - Text Formatting and Alignment
 * 
 * padStart() and padEnd() solve common text formatting needs:
 * - Aligning numbers in reports
 * - Creating fixed-width displays
 * - Formatting IDs with leading zeros
 * - Creating simple ASCII tables
 */

// Creating a formatted transaction report
const transactions = [
    { id: 1, description: 'Grocery Store', amount: -45.67 },
    { id: 23, description: 'Salary Deposit', amount: 2500.00 },
    { id: 456, description: 'Coffee Shop', amount: -4.25 },
    { id: 7890, description: 'Freelance Payment', amount: 750.00 }
];

console.log('\n=== Transaction Report ===');
console.log('ID'.padEnd(6) + 'Description'.padEnd(20) + 'Amount'.padStart(10));
console.log('-'.repeat(36));

transactions.forEach(({ id, description, amount }) => {
    // Format each field with proper alignment
    const formattedId = id.toString().padEnd(6);
    const formattedDesc = description.padEnd(20);
    const formattedAmount = (amount >= 0 ? '+' : '') + amount.toFixed(2).padStart(9);
    
    console.log(formattedId + formattedDesc + formattedAmount);
});

// ============================================================================
// ES2018 (ES9) - OBJECT SPREAD AND ASYNC ITERATION
// ============================================================================

/**
 * Object Spread and Rest - Immutable Object Operations
 * 
 * Object spread (...) enables functional programming patterns with objects,
 * making it easy to create modified copies without mutating originals.
 * Essential for state management in React, Redux, and other frameworks.
 */

const baseConfig = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retryAttempts: 3,
    authentication: {
        type: 'bearer',
        refreshTokens: true
    }
};

// Creating environment-specific configs without mutation
const developmentConfig = {
    ...baseConfig, // Spread all base properties
    apiUrl: 'https://api-dev.example.com', // Override specific properties
    timeout: 10000, // Longer timeout for development
    debug: true, // Add new properties
    authentication: {
        ...baseConfig.authentication, // Nested spread for deep copying
        mockAuth: true // Add development-specific auth setting
    }
};

const productionConfig = {
    ...baseConfig,
    retryAttempts: 5, // More retries in production
    caching: {
        enabled: true,
        ttl: 300000
    },
    authentication: {
        ...baseConfig.authentication,
        strictMode: true
    }
};

// Object rest for extracting specific properties
function processApiResponse({ data, status, headers, ...metadata }) {
    // 'data', 'status', 'headers' are extracted as individual variables
    // 'metadata' contains all other properties as a new object
    
    console.log('Response status:', status);
    console.log('Data length:', data?.length || 'No data');
    console.log('Additional metadata:', Object.keys(metadata));
    
    return {
        processed: true,
        dataSize: data?.length || 0,
        ...metadata // Spread remaining metadata into return object
    };
}

const apiResponse = {
    data: [1, 2, 3, 4, 5],
    status: 200,
    headers: { 'content-type': 'application/json' },
    timestamp: Date.now(),
    requestId: 'abc123',
    cacheHit: false
};

const processed = processApiResponse(apiResponse);
console.log('Processed response:', processed);

/**
 * Promise.finally() - Cleanup Logic for Async Operations
 * 
 * finally() provides a way to execute cleanup code regardless of promise
 * resolution or rejection. Critical for resource management, loading states,
 * and consistent cleanup in async operations.
 */

class DataLoader {
    constructor() {
        this.isLoading = false;
        this.loadingElement = null; // Simulate DOM element
    }
    
    async loadUserData(userId) {
        // Set loading state
        this.isLoading = true;
        this.showLoadingSpinner();
        
        try {
            // Simulate API call with potential failure
            const userData = await this.fetchUserFromAPI(userId);
            
            // Process successful response
            console.log('User data loaded:', userData);
            return userData;
            
        } catch (error) {
            // Handle errors
            console.error('Failed to load user data:', error.message);
            throw error; // Re-throw for caller to handle
            
        } finally {
            // Cleanup always executes regardless of success/failure
            // This is perfect for UI state cleanup, resource disposal, etc.
            this.isLoading = false;
            this.hideLoadingSpinner();
            console.log('Loading operation completed, cleanup finished');
        }
    }
    
    showLoadingSpinner() {
        console.log('🔄 Loading spinner shown');
    }
    
    hideLoadingSpinner() {
        console.log('✅ Loading spinner hidden');
    }
    
    async fetchUserFromAPI(userId) {
        // Simulate network delay and potential failure
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (userId === 'error') {
            throw new Error('User not found');
        }
        
        return { id: userId, name: 'John Doe', email: 'john@example.com' };
    }
}

// Using Promise.finally() for consistent cleanup
const loader = new DataLoader();

async function demonstrateFinally() {
    try {
        await loader.loadUserData('123'); // Success case
        await loader.loadUserData('error'); // Error case
    } catch (error) {
        console.log('Caught error, but cleanup still happened');
    }
}

// ============================================================================
// ES2019 (ES10) - ARRAY FLATTENING AND OBJECT UTILITIES
// ============================================================================

/**
 * Array.flat() and Array.flatMap() - Nested Array Processing
 * 
 * Common in data processing scenarios where you have nested structures
 * from API responses, file processing, or hierarchical data.
 */

// Real-world example: Processing nested comment threads
const commentThreads = [
    {
        id: 1,
        text: 'Great article!',
        replies: [
            { id: 2, text: 'I agree!' },
            { id: 3, text: 'Thanks for sharing' }
        ]
    },
    {
        id: 4,
        text: 'Interesting perspective',
        replies: [
            { id: 5, text: 'Could you elaborate?' },
            { id: 6, text: 'Here\'s another viewpoint...', 
              replies: [{ id: 7, text: 'Nested discussion' }] }
        ]
    }
];

// Extract all comments into flat array for search/processing
function flattenComments(threads) {
    return threads.flatMap(comment => {
        // flatMap combines map + flat operations
        // For each comment, return array including the comment and its replies
        const allReplies = comment.replies ? comment.replies.flat(Infinity) : [];
        return [
            { id: comment.id, text: comment.text, level: 0 },
            ...allReplies.map(reply => ({ ...reply, level: 1 }))
        ];
    });
}

const allComments = flattenComments(commentThreads);
console.log('All comments flattened:', allComments.length);

/**
 * Object.fromEntries() - Reverse of Object.entries()
 * 
 * Perfect for transforming arrays back into objects, especially useful
 * for filtering, mapping, or processing object entries and reconstructing
 * the object with modifications.
 */

// Transform and filter object properties
const rawUserPreferences = {
    theme: 'dark',
    fontSize: '14px',
    enableNotifications: 'true',
    maxItems: '50',
    debugMode: 'false',
    apiVersion: 'v2'
};

// Convert string values to appropriate types and filter
const processedPreferences = Object.fromEntries(
    Object.entries(rawUserPreferences)
        .map(([key, value]) => {
            // Transform values based on patterns
            if (value === 'true' || value === 'false') {
                return [key, value === 'true']; // Convert to boolean
            }
            if (/^\d+$/.test(value)) {
                return [key, parseInt(value, 10)]; // Convert to number
            }
            return [key, value]; // Keep as string
        })
        .filter(([key, value]) => key !== 'debugMode') // Remove debug settings for production
);

console.log('Processed preferences:', processedPreferences);

// ============================================================================
// ES2020 (ES11) - OPTIONAL CHAINING AND NULLISH COALESCING
// ============================================================================

/**
 * Optional Chaining (?.) - Safe Property Access
 * 
 * Eliminates the need for verbose null/undefined checks when accessing
 * nested properties. Essential for working with APIs that return
 * inconsistent or optional data structures.
 */

// Realistic API response that might have missing data
const apiResponses = [
    {
        user: {
            profile: {
                name: 'John Doe',
                avatar: { url: 'https://example.com/avatar1.jpg', size: 'large' },
                settings: {
                    notifications: { email: true, push: false },
                    privacy: { showProfile: true }
                }
            }
        }
    },
    {
        user: {
            profile: {
                name: 'Jane Smith',
                // avatar is missing
                settings: {
                    notifications: { email: false }
                    // privacy is missing
                }
            }
        }
    },
    {
        user: {
            profile: {
                name: 'Bob Wilson'
                // settings is completely missing
            }
        }
    },
    {
        // user might be null/undefined
        user: null
    }
];

// Process each response safely without crashes
function extractUserInfo(response) {
    return {
        name: response.user?.profile?.name || 'Unknown User',
        avatarUrl: response.user?.profile?.avatar?.url || '/default-avatar.png',
        emailNotifications: response.user?.profile?.settings?.notifications?.email ?? true, // Use nullish coalescing
        profileVisible: response.user?.profile?.settings?.privacy?.showProfile ?? false,
        hasCustomAvatar: response.user?.profile?.avatar?.url ? true : false
    };
}

console.log('\n=== Safe User Data Extraction ===');
apiResponses.forEach((response, index) => {
    const userInfo = extractUserInfo(response);
    console.log(`Response ${index + 1}:`, userInfo);
});

/**
 * Nullish Coalescing (??) - Default Values for null/undefined Only
 * 
 * Unlike || operator, ?? only triggers for null/undefined, not for other
 * falsy values like 0, '', false. Critical for handling optional parameters
 * and configuration values where falsy values might be valid.
 */

function createUserProfile(options = {}) {
    // Using nullish coalescing to handle edge cases properly
    const profile = {
        // These should use || because empty string/0 are invalid
        name: options.name || 'Anonymous',
        email: options.email || 'no-email@example.com',
        
        // These should use ?? because 0/false are valid values
        age: options.age ?? 18, // 0 is a valid age
        isVerified: options.isVerified ?? false, // false is a valid verification status
        postCount: options.postCount ?? 0, // 0 is a valid post count
        
        // Nested object with nullish coalescing
        settings: {
            theme: options.settings?.theme ?? 'light',
            fontSize: options.settings?.fontSize ?? 14,
            showAdvanced: options.settings?.showAdvanced ?? false
        }
    };
    
    return profile;
}

// Test different scenarios
const profiles = [
    createUserProfile({ name: 'John', age: 0, postCount: 0, isVerified: false }),
    createUserProfile({ name: 'Jane', settings: { theme: 'dark', showAdvanced: true } }),
    createUserProfile({}), // All defaults
    createUserProfile({ name: '', age: null, settings: null }) // Edge cases
];

console.log('\n=== Profile Creation with Nullish Coalescing ===');
profiles.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`, JSON.stringify(profile, null, 2));
});

// ============================================================================
// ES2021 (ES12) - LOGICAL ASSIGNMENT AND UTILITY METHODS
// ============================================================================

/**
 * Logical Assignment Operators - Conditional Assignment Patterns
 * 
 * Combines logical operators with assignment, creating concise patterns
 * for conditional updates, default value setting, and state management.
 */

class ConfigManager {
    constructor() {
        this.config = {};
        this.cache = null;
        this.errors = [];
    }
    
    // Nullish assignment (??=) - set only if null/undefined
    setDefault(key, value) {
        this.config[key] ??= value; // Only set if config[key] is null/undefined
        return this;
    }
    
    // Logical OR assignment (||=) - set if falsy
    setFallback(key, fallback) {
        this.config[key] ||= fallback; // Set if config[key] is falsy
        return this;
    }
    
    // Logical AND assignment (&&=) - update if truthy
    updateIfExists(key, newValue) {
        this.config[key] &&= newValue; // Only update if config[key] is truthy
        return this;
    }
    
    // Practical example: lazy loading with caching
    getProcessedConfig() {
        // Cache result only if it doesn't exist (nullish assignment)
        this.cache ??= this.processConfig();
        return this.cache;
    }
    
    processConfig() {
        console.log('Processing configuration...');
        return { ...this.config, processed: true, timestamp: Date.now() };
    }
    
    // Error accumulation pattern
    addError(error) {
        this.errors ||= []; // Initialize array if it doesn't exist
        this.errors.push(error);
    }
}

const configManager = new ConfigManager();

// Demonstrate logical assignment patterns
configManager
    .setDefault('theme', 'light') // Sets because config.theme is undefined
    .setDefault('theme', 'dark') // Doesn't set because config.theme exists
    .setFallback('name', 'Default App') // Sets because config.name is undefined
    .setFallback('name', 'Another Name') // Sets because config.name was set to falsy value
    .updateIfExists('theme', 'blue') // Updates because config.theme is truthy
    .updateIfExists('nonexistent', 'value'); // Doesn't update because key doesn't exist

console.log('Final config:', configManager.config);
console.log('Processed config (first call):', configManager.getProcessedConfig());
console.log('Processed config (cached):', configManager.getProcessedConfig()); // Uses cache

/**
 * String.replaceAll() - Global String Replacement
 * 
 * Replaces all occurrences without regex complexity or global flag issues.
 * Simpler and more reliable than regex for literal string replacements.
 */

// Clean and sanitize user input
function sanitizeUserContent(content) {
    return content
        .replaceAll('<script>', '') // Remove potential XSS
        .replaceAll('</script>', '')
        .replaceAll('  ', ' ') // Normalize multiple spaces
        .replaceAll('\r\n', '\n') // Normalize line endings
        .replaceAll('&', '&amp;') // HTML encode ampersands
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

const userInput = '<script>alert("xss")</script>Hello  world\r\nThis is a test & more';
console.log('Sanitized content:', sanitizeUserContent(userInput));

// ============================================================================
// ES2022 (ES13) - TOP-LEVEL AWAIT AND CLASS ENHANCEMENTS
// ============================================================================

/**
 * Class Field Declarations and Private Methods
 * 
 * Modern class syntax with true privacy and cleaner field declarations.
 * These features make JavaScript classes more predictable and maintainable.
 */

class ModernAPIClient {
    // Public field declarations
    baseURL = 'https://api.example.com';
    timeout = 5000;
    
    // Private fields (truly private, not accessible outside class)
    #apiKey = null;
    #cache = new Map();
    #requestCount = 0;
    
    constructor(apiKey) {
        this.#apiKey = apiKey;
        console.log('API client initialized');
    }
    
    // Private method (can only be called from within class)
    #buildHeaders() {
        return {
            'Authorization': `Bearer ${this.#apiKey}`,
            'Content-Type': 'application/json',
            'X-Client-Version': '1.0.0'
        };
    }
    
    #getCacheKey(endpoint, params) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }
    
    // Public method using private fields and methods
    async get(endpoint, params = {}) {
        const cacheKey = this.#getCacheKey(endpoint, params);
        
        // Check cache first
        if (this.#cache.has(cacheKey)) {
            console.log('Cache hit for:', endpoint);
            return this.#cache.get(cacheKey);
        }
        
        // Increment private request counter
        this.#requestCount++;
        
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.#buildHeaders(), // Use private method
                timeout: this.timeout
            });
            
            const data = await response.json();
            this.#cache.set(cacheKey, data); // Cache the response
            
            return data;
        } catch (error) {
            console.error('API request failed:', error.message);
            throw error;
        }
    }
    
    // Getter for private field (controlled access)
    get requestCount() {
        return this.#requestCount;
    }
    
    // Method to clear private cache
    clearCache() {
        this.#cache.clear();
        console.log('Cache cleared');
    }
}

// Usage - private fields/methods are completely inaccessible
const apiClient = new ModernAPIClient('secret-key-123');

// This would work:
// apiClient.get('/users', { page: 1 });

// This would throw an error (private field access):
// console.log(apiClient.#apiKey); // SyntaxError: Private field '#apiKey' must be declared in an enclosing class

/**
 * Array.at() - Negative Indexing for Arrays
 * 
 * Provides Python-style negative indexing, making it easier to access
 * elements from the end of arrays without calculating indices.
 */

const recentSearches = ['javascript', 'react', 'nodejs', 'typescript', 'vue'];

// Traditional way to get last element
const lastTraditional = recentSearches[recentSearches.length - 1];

// Modern way with negative indexing
const lastModern = recentSearches.at(-1); // Last element
const secondLast = recentSearches.at(-2); // Second to last
const first = recentSearches.at(0); // First element (same as [0])

console.log('Traditional last:', lastTraditional);
console.log('Modern last:', lastModern);
console.log('Second to last:', secondLast);

// Useful in loops and functional programming
const getBookends = (arr) => ({
    first: arr.at(0),
    last: arr.at(-1),
    secondFirst: arr.at(1),
    secondLast: arr.at(-2)
});

console.log('Array bookends:', getBookends(recentSearches));

// Export comprehensive examples for testing and learning
module.exports = {
    calculateCompoundInterest,
    DataLoader,
    ConfigManager,
    ModernAPIClient,
    sanitizeUserContent,
    flattenComments,
    extractUserInfo,
    createUserProfile,
    processApiResponse,
    getBookends,
    // Utility functions for modern JavaScript patterns
    safeAccess: (obj, path) => path.split('.').reduce((current, key) => current?.[key], obj),
    withDefaults: (options, defaults) => ({ ...defaults, ...options }),
    createEnum: (...values) => Object.freeze(Object.fromEntries(values.map(v => [v, v])))
};