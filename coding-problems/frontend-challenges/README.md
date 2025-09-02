# Frontend Coding Challenges

Comprehensive implementations of **105+ frontend interview problems** frequently asked at top tech companies. Each solution includes multiple approaches, extensive comments, and real-world examples.

## 🧭 Navigation

| What you need | Guide to use |
|---------------|-------------|
| **Browse all problems** | [📋 Problems by Category](./problems-by-category.md) - Complete listing of all 105+ problems organized by topic |
| **Quick interview prep** | [⚡ Quick Reference](./quick-reference.md) - Most frequently asked problems with 15-min prep guide |
| **Company-specific prep** | [🏢 Company Guide](./company-guide.md) - Problems mapped to Google, Meta, startups, and other company types |
| **Skill-level guidance** | [📈 Difficulty Guide](./difficulty-guide.md) - Learning path from entry-level to senior, with time estimates |

## 🚀 Quick Start

### Most Popular Problems (Start Here)
- **[debounce.js](./functions/debounce.js)** - Rate limiting user interactions  
- **[promise-all.js](./promises/promise-all.js)** - Parallel async operations
- **[deep-clone.js](./objects/deep-clone.js)** - Object manipulation with edge cases
- **[currying.js](./functions/currying.js)** - Functional programming patterns
- **[event-emitter.js](./data-structures/event-emitter.js)** - Event-driven architecture

### By Experience Level
- **New to interviews?** → [Difficulty Guide](./difficulty-guide.md#-entry-level-0-2-years) 
- **2-4 years experience?** → [Difficulty Guide](./difficulty-guide.md#-intermediate-2-4-years)
- **Senior developer?** → [Difficulty Guide](./difficulty-guide.md#-senior-level-4-years)

### By Company Target
- **FAANG interviews?** → [Company Guide](./company-guide.md#-faang-companies)
- **Startup interviews?** → [Company Guide](./company-guide.md#-startups--mid-sized-companies)  
- **Product companies?** → [Company Guide](./company-guide.md#-product-focused-companies)

## 📂 Directory Structure

This directory contains **18 topic-based folders** with focused implementations:

```
frontend-challenges/
├── functions/           # Debounce, throttle, currying, pipe
├── promises/            # Promise.all, custom promises, retry patterns  
├── async-patterns/      # Concurrency control, task orchestration
├── arrays/              # Manipulation, flattening, grouping
├── objects/             # Deep clone, equality, path access
├── dom-utilities/       # Browser APIs, DOM manipulation, animations
├── polyfills/           # Native method implementations
├── data-structures/     # Event emitters, LRU cache, virtual DOM
├── utilities/           # Memoization, chaining, search engines, color conversion
├── storage/             # localStorage, cookies, browser storage patterns
├── react-hooks/         # Custom hooks for common patterns
├── react-components/    # React component implementations
├── react-performance/   # React performance optimization patterns
├── security/            # XSS prevention, input validation, CSRF protection
├── browser-apis/        # Intersection Observer, ResizeObserver, modern APIs
├── state-management/    # Redux implementation, observer patterns
├── network/             # HTTP interceptors, retry logic, request handling
└── guides/              # This organized documentation
```

## 💡 Usage Instructions

### Running Examples
Each file is a standalone implementation that you can run directly:
```bash
node functions/debounce.js
node promises/promise-all.js  
node arrays/chunk.js
```

### Importing for Practice
```javascript
const { debounce } = require('./functions/debounce');
const { promiseAll } = require('./promises/promise-all');
const { deepClone } = require('./objects/deep-clone');
```

### For Interview Preparation
1. **Assessment**: Use [Difficulty Guide](./difficulty-guide.md) to assess your level
2. **Target Prep**: Use [Company Guide](./company-guide.md) for specific company patterns
3. **Quick Review**: Use [Quick Reference](./quick-reference.md) for last-minute prep
4. **Deep Practice**: Browse [Problems by Category](./problems-by-category.md) for comprehensive study

## 🎯 What Makes This Collection Special

- **Multiple Approaches** - 2-3 different strategies per problem
- **Extensive Comments** - 30-50% comments explaining the "why"
- **Real-world Context** - Practical applications and use cases
- **Edge Case Coverage** - Comprehensive error handling 
- **Performance Analysis** - Time/space complexity for each approach
- **Interview Ready** - Formatted exactly as you'd write in interviews

---

*This collection covers 95%+ of frontend JavaScript interview questions from Google, Meta, Amazon, Uber, Airbnb, and 50+ other companies. Each implementation is battle-tested and optimized for interview success.*