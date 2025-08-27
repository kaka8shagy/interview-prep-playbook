# Coding Problems for Interviews

A curated collection of coding problems frequently asked in staff/architect level interviews.

## Problem Categories

### 🧮 Algorithms
Classic algorithm problems with focus on optimization and trade-offs.

- [Dynamic Programming](./algorithms/dynamic-programming.md)
- [Graph Algorithms](./algorithms/graph-algorithms.md)
- [Tree Traversals](./algorithms/tree-traversals.md)
- [Sorting & Searching](./algorithms/sorting-searching.md)
- [String Manipulation](./algorithms/string-manipulation.md)
- [Backtracking](./algorithms/backtracking.md)

### 🌐 Frontend Challenges
Browser and JavaScript specific implementation problems.

- [Implement Promise](./frontend-challenges/implement-promise.md)
- [Virtual DOM](./frontend-challenges/virtual-dom.md)
- [Event Emitter](./frontend-challenges/event-emitter.md)
- [Debounce & Throttle](./frontend-challenges/debounce-throttle.md)
- [Infinite Scroll](./frontend-challenges/infinite-scroll.md)
- [Autocomplete](./frontend-challenges/autocomplete.md)

### ⚙️ System Implementation
Build components of distributed systems.

- [LRU Cache](./system-implementation/lru-cache.md)
- [Rate Limiter](./system-implementation/rate-limiter.md)
- [Task Scheduler](./system-implementation/task-scheduler.md)
- [Connection Pool](./system-implementation/connection-pool.md)
- [Message Queue](./system-implementation/message-queue.md)
- [Distributed Lock](./system-implementation/distributed-lock.md)

## Difficulty Levels

### 🟢 Senior Level
- Basic data structure implementation
- Simple algorithm optimization
- Common design patterns
- Time: 30-45 minutes

### 🟡 Staff Level
- Complex algorithm design
- System component implementation
- Performance optimization required
- Time: 45-60 minutes

### 🔴 Principal/Architect Level
- Distributed system components
- Scalability considerations
- Multiple trade-offs to consider
- Time: 60-90 minutes

## Problem-Solving Framework

### 1. Understand (5-10 mins)
- Clarify requirements
- Identify edge cases
- Confirm input/output format
- Ask about constraints

### 2. Design (5-10 mins)
- Discuss approach
- Consider multiple solutions
- Analyze time/space complexity
- Choose optimal approach

### 3. Implement (20-30 mins)
- Write clean, readable code
- Handle edge cases
- Use proper naming
- Add comments for complex logic

### 4. Test (5-10 mins)
- Walk through examples
- Test edge cases
- Verify complexity
- Discuss optimizations

### 5. Optimize (5-10 mins)
- Improve time/space complexity
- Refactor for readability
- Discuss trade-offs
- Consider scalability

## Common Patterns

### Algorithm Patterns
- **Two Pointers**: Array/string problems
- **Sliding Window**: Subarray/substring problems
- **Fast & Slow Pointers**: Cycle detection
- **Merge Intervals**: Overlapping ranges
- **Binary Search**: Sorted array problems
- **BFS/DFS**: Tree/graph traversal
- **Dynamic Programming**: Optimization problems
- **Backtracking**: Combination/permutation

### Data Structure Patterns
- **Hash Map**: Fast lookups, counting
- **Stack**: Matching parentheses, undo
- **Queue**: BFS, order processing
- **Heap**: Top K problems, scheduling
- **Trie**: Prefix matching, autocomplete
- **Union Find**: Connected components

## Interview Tips

### Before Coding
1. **Don't Rush**: Take time to understand
2. **Ask Questions**: Clarify ambiguities
3. **Think Aloud**: Share your thought process
4. **Consider Edge Cases**: Empty, single, large inputs
5. **Discuss Approach**: Before writing code

### While Coding
1. **Start Simple**: Get a working solution first
2. **Write Clean Code**: Readable over clever
3. **Handle Errors**: Show defensive programming
4. **Test as You Go**: Verify each component
5. **Communicate**: Explain what you're doing

### After Coding
1. **Test Thoroughly**: Walk through examples
2. **Analyze Complexity**: Time and space
3. **Discuss Optimizations**: Show depth
4. **Consider Scale**: How it works with large data
5. **Be Open**: To feedback and suggestions

## Study Plan

### Week 1: Data Structures
- Implement from scratch
- Understand operations complexity
- Practice common problems

### Week 2: Algorithms
- Master common patterns
- Practice on LeetCode/HackerRank
- Focus on optimization

### Week 3: System Components
- Build real components
- Consider distributed scenarios
- Focus on scalability

### Week 4: Mock Interviews
- Time-boxed practice
- Get feedback
- Improve communication

## Language-Specific Tips

### JavaScript
```javascript
// Use modern ES6+ features
const result = arr.filter(x => x > 0).map(x => x * 2);

// Understand closures
function counter() {
  let count = 0;
  return () => ++count;
}

// Know async patterns
async function fetchData() {
  const data = await fetch(url);
  return data.json();
}
```

### Python
```python
# Use list comprehensions
result = [x * 2 for x in arr if x > 0]

# Know built-in functions
from collections import defaultdict, deque, Counter
from heapq import heappush, heappop

# Understand generators
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
```

## Complexity Cheat Sheet

### Time Complexity
- O(1): Constant - Hash table lookup
- O(log n): Logarithmic - Binary search
- O(n): Linear - Simple loop
- O(n log n): Linearithmic - Efficient sorting
- O(n²): Quadratic - Nested loops
- O(2ⁿ): Exponential - Recursive subsets

### Space Complexity
- O(1): Constant - Fixed variables
- O(n): Linear - Array/list storage
- O(n²): Quadratic - 2D matrix
- Recursive: Add call stack space

## Resources

Each problem includes:
- Problem statement
- Input/output examples
- Constraints
- Multiple solutions
- Complexity analysis
- Test cases
- Related problems

## Practice Platforms
- **LeetCode**: Comprehensive problem set
- **HackerRank**: Good for basics
- **CodeSignal**: Real interview simulations
- **Pramp**: Mock interviews
- **System Design Primer**: System problems

## Quick Links
- [All Solutions](./algorithms/solutions/)
- [Frontend Solutions](./frontend-challenges/solutions/)
- [System Solutions](./system-implementation/solutions/)