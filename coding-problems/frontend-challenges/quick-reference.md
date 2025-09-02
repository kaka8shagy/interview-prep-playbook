# Quick Reference Guide

Fast lookup table for the most frequently asked frontend interview problems. Perfect for last-minute prep or specific topic review.

## 🎯 Most Frequently Asked Problems

| Looking for... | Go to File | Interview Frequency |
|----------------|------------|-------------------|
| **Debounce/Throttle** | [debounce.js](./functions/debounce.js), [throttle.js](./functions/throttle.js) | ⭐⭐⭐⭐⭐ |
| **Promise Methods** | [promise-all.js](./promises/promise-all.js), [promise-retry.js](./promises/promise-retry.js) | ⭐⭐⭐⭐⭐ |
| **Deep Clone/Equal** | [deep-clone.js](./objects/deep-clone.js), [deep-equal.js](./objects/deep-equal.js) | ⭐⭐⭐⭐ |
| **Array Methods** | [lodash-groupby.js](./arrays/lodash-groupby.js), [deep-flatten.js](./arrays/deep-flatten.js) | ⭐⭐⭐⭐ |
| **Function Programming** | [currying.js](./functions/currying.js), [pipe-method.js](./functions/pipe-method.js) | ⭐⭐⭐⭐ |
| **Caching/Memoization** | [memoize-cache.js](./utilities/memoize-cache.js) | ⭐⭐⭐ |
| **Event Handling** | [event-emitter.js](./data-structures/event-emitter.js) | ⭐⭐⭐ |
| **Polyfills** | [call-apply-bind-polyfills.js](./polyfills/call-apply-bind-polyfills.js) | ⭐⭐⭐ |
| **Method Chaining** | [chain-calculator.js](./utilities/chain-calculator.js) | ⭐⭐ |
| **Sequential Promises** | [promises-sequence.js](./async-patterns/promises-sequence.js) | ⭐⭐ |
| **Progress Tracking** | [async-progress-bar.js](./async-patterns/async-progress-bar.js) | ⭐⭐ |
| **Concurrency Control** | [map-limit.js](./async-patterns/map-limit.js) | ⭐⭐ |
| **Promise Cancellation** | [cancelable-promise.js](./promises/cancelable-promise.js) | ⭐⭐ |
| **Task Dependencies** | [task-dependency-resolution.js](./async-patterns/task-dependency-resolution.js) | ⭐ |
| **HTML Encoding** | [html-encoding.js](./dom-utilities/html-encoding.js) | ⭐⭐⭐ |
| **Sleep/Delay** | [sleep-function.js](./utilities/sleep-function.js) | ⭐⭐ |
| **Storage with TTL** | [localstorage-expiry.js](./storage/localstorage-expiry.js) | ⭐⭐ |
| **CSS Selector Generation** | [css-selector-generator.js](./dom-utilities/css-selector-generator.js) | ⭐⭐ |
| **Color Conversion** | [hex-rgb-converter.js](./utilities/hex-rgb-converter.js) | ⭐⭐ |

## 🔍 Problems by Pattern Type

### ⏱️ Timing & Control Flow
**When to use:** Rate limiting, user interaction optimization, API management

- [debounce.js](./functions/debounce.js) - Delay execution until activity stops
- [throttle.js](./functions/throttle.js) - Limit execution frequency
- [promise-retry.js](./promises/promise-retry.js) - Retry failed operations with backoff
- [sleep-function.js](./utilities/sleep-function.js) - Promise-based delays and timing
- [animate-sequence.js](./dom-utilities/animate-sequence.js) - Sequential animation timing

### 🔄 Data Transformation  
**When to use:** Data processing, API response handling, functional programming

- [deep-clone.js](./objects/deep-clone.js) - Create independent object copies
- [deep-equal.js](./objects/deep-equal.js) - Compare complex data structures
- [deep-flatten.js](./arrays/deep-flatten.js) - Flatten nested arrays
- [pipe-method.js](./functions/pipe-method.js) - Chain data transformations
- [currying.js](./functions/currying.js) - Create specialized functions
- [filter-multidimensional.js](./utilities/filter-multidimensional.js) - Filter nested data structures
- [count-multidimensional.js](./utilities/count-multidimensional.js) - Count elements in nested arrays
- [hex-rgb-converter.js](./utilities/hex-rgb-converter.js) - Color format conversions

### ⚡ Async Programming
**When to use:** API coordination, concurrent operations, user feedback

- [promise-all.js](./promises/promise-all.js) - Parallel promise execution
- [promises-sequence.js](./async-patterns/promises-sequence.js) - Sequential execution
- [map-limit.js](./async-patterns/map-limit.js) - Controlled concurrency
- [cancelable-promise.js](./promises/cancelable-promise.js) - Cancelable operations
- [event-emitter.js](./data-structures/event-emitter.js) - Event-driven communication

### 🌐 DOM & Browser APIs
**When to use:** DOM manipulation, user interaction, security

- [html-encoding.js](./dom-utilities/html-encoding.js) - XSS prevention and string safety
- [css-selector-generator.js](./dom-utilities/css-selector-generator.js) - Dynamic element identification
- [highlight-words.js](./dom-utilities/highlight-words.js) - Text search and highlighting
- [polyfill-getelementsbyclassname.js](./dom-utilities/polyfill-getelementsbyclassname.js) - Cross-browser compatibility

### 💾 Storage & State
**When to use:** Data persistence, caching, user preferences

- [localstorage-expiry.js](./storage/localstorage-expiry.js) - Browser storage with TTL
- [custom-cookies.js](./storage/custom-cookies.js) - Advanced cookie management

### 🚀 Performance Optimization
**When to use:** Expensive computations, frequent operations, resource management

- [memoize-cache.js](./utilities/memoize-cache.js) - Function result caching
- [typehead-lru-cache.js](./data-structures/typehead-lru-cache.js) - Limited memory cache
- [virtual-dom.js](./data-structures/virtual-dom.js) - Efficient DOM updates

## ⚡ 15-Minute Interview Prep

### If you have 15 minutes before interview:
1. **[debounce.js](./functions/debounce.js)** - Most common question
2. **[promise-all.js](./promises/promise-all.js)** - Shows async understanding  
3. **[deep-clone.js](./objects/deep-clone.js)** - Demonstrates edge case thinking

### If you have 30 minutes:
Add these to the above:
4. **[throttle.js](./functions/throttle.js)** - Complements debounce knowledge
5. **[currying.js](./functions/currying.js)** - Shows functional programming skills
6. **[event-emitter.js](./data-structures/event-emitter.js)** - Architecture understanding

### If you have 1 hour:
Add advanced patterns:
7. **[promises-sequence.js](./async-patterns/promises-sequence.js)** - Complex async coordination
8. **[memoize-cache.js](./utilities/memoize-cache.js)** - Performance optimization
9. **[call-apply-bind-polyfills.js](./polyfills/call-apply-bind-polyfills.js)** - Deep JavaScript knowledge

## 🎪 Company Quick Prep

### FAANG Interview (Same Day)
Focus on these 5 problems with edge cases:
- [debounce.js](./functions/debounce.js) + [throttle.js](./functions/throttle.js)
- [promise-all.js](./promises/promise-all.js)  
- [deep-clone.js](./objects/deep-clone.js)
- [currying.js](./functions/currying.js)
- [task-dependency-resolution.js](./async-patterns/task-dependency-resolution.js)

### Startup Interview (Same Day)
Focus on practical implementations:
- [debounce.js](./functions/debounce.js)
- [deep-flatten.js](./arrays/deep-flatten.js)
- [memoize-cache.js](./utilities/memoize-cache.js)
- [promisify.js](./utilities/promisify.js)

### Product Company Interview (Same Day)  
Focus on user-facing features:
- [async-progress-bar.js](./async-patterns/async-progress-bar.js)
- [event-emitter.js](./data-structures/event-emitter.js)
- [lodash-groupby.js](./arrays/lodash-groupby.js)
- [map-limit.js](./async-patterns/map-limit.js)

---

**Navigation:** [Main README](./README.md) | [Problems by Category](./problems-by-category.md) | [Company Guide](./company-guide.md) | [Difficulty Guide](./difficulty-guide.md)