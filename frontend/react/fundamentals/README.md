# React Fundamentals

## Quick Summary
- React is a JavaScript library for building user interfaces
- Uses component-based architecture and unidirectional data flow
- Virtual DOM provides efficient updates through reconciliation
- JSX syntax combines JavaScript and markup declaratively
- Functional components with hooks are the modern approach

## Core Concepts

### Components
Building blocks of React applications that encapsulate UI and logic.

Basic components: `./code/component-basics.jsx`

### JSX
JavaScript XML that allows mixing HTML-like syntax with JavaScript.

JSX examples: `./code/jsx-examples.jsx`

### Virtual DOM
JavaScript representation of the actual DOM that enables efficient updates.

Virtual DOM concepts: `./code/virtual-dom-demo.jsx`

### Props
Read-only properties passed from parent to child components.

Props patterns: `./code/props-patterns.jsx`

### State
Mutable data that determines component rendering behavior.

State examples: `./code/state-examples.jsx`

## Component Lifecycle

### Mounting
Component creation and initial render process.

Mounting examples: `./code/mounting-lifecycle.jsx`

### Updating
Component re-rendering due to prop or state changes.

Update patterns: `./code/updating-lifecycle.jsx`

### Unmounting
Component cleanup and removal process.

Cleanup patterns: `./code/unmounting-cleanup.jsx`

## Event Handling

### Synthetic Events
React's cross-browser event system.

Event examples: `./code/synthetic-events.jsx`

### Event Binding
Handling this context in event handlers.

Binding patterns: `./code/event-binding.jsx`

### Event Delegation
How React handles events efficiently.

Delegation examples: `./code/event-delegation.jsx`

## Conditional Rendering

### if/else Patterns
Different approaches to conditional rendering.

Conditional examples: `./code/conditional-rendering.jsx`

### Ternary Operators
Inline conditional rendering patterns.

Ternary patterns: `./code/ternary-patterns.jsx`

### Logical Operators
Using && and || for conditional rendering.

Logical examples: `./code/logical-operators.jsx`

## Lists and Keys

### Rendering Lists
Efficiently rendering arrays of data.

List examples: `./code/list-rendering.jsx`

### Key Prop
Helping React identify list items for efficient updates.

Key patterns: `./code/key-patterns.jsx`

### Dynamic Lists
Handling list updates and modifications.

Dynamic examples: `./code/dynamic-lists.jsx`

## Interview Questions

### Question 1: Component Communication
Implement parent-child communication patterns.
- Solution: `./code/interview-communication.jsx`
- Tests props and callback patterns

### Question 2: Dynamic Form
Build form with dynamic field generation.
- Solution: `./code/interview-dynamic-form.jsx`
- Tests state management and lists

### Question 3: Lifecycle Methods
Convert class component to functional with hooks.
- Solution: `./code/interview-lifecycle-conversion.jsx`
- Tests lifecycle understanding

### Question 4: Custom Toggle Component
Build reusable toggle with multiple states.
- Solution: `./code/interview-toggle-component.jsx`
- Tests component design

## Class vs Functional Components

### Class Components
Traditional React component approach.

Class examples: `./code/class-components.jsx`

### Functional Components
Modern React approach with hooks.

Functional examples: `./code/functional-components.jsx`

### Migration Patterns
Converting between component types.

Migration guide: `./code/component-migration.jsx`

## Data Flow

### Unidirectional Flow
Data flows down, events flow up pattern.

Flow examples: `./code/data-flow.jsx`

### Prop Drilling
Passing props through multiple component levels.

Drilling examples: `./code/prop-drilling.jsx`

### State Lifting
Moving state to common ancestor.

Lifting patterns: `./code/state-lifting.jsx`

## Common Patterns

### Container Components
Separating logic from presentation.

Container examples: `./code/container-patterns.jsx`

### Composition
Building complex UIs from simple components.

Composition patterns: `./code/composition-patterns.jsx`

### Children Prop
Using children for flexible component APIs.

Children examples: `./code/children-patterns.jsx`

## Error Handling

### Error Boundaries
Catching JavaScript errors in component tree.

Error boundary examples: `./code/error-boundaries.jsx`

### Error Recovery
Graceful error handling strategies.

Recovery patterns: `./code/error-recovery.jsx`

## Performance Basics

### Re-rendering
Understanding when components re-render.

Re-render examples: `./code/rerender-examples.jsx`

### Keys and Reconciliation
How React determines what to update.

Reconciliation examples: `./code/reconciliation-demo.jsx`

## Common Pitfalls

### Pitfall 1: Direct State Mutation
Modifying state objects directly.
Solution: `./code/pitfall-state-mutation.jsx`

### Pitfall 2: Missing Keys
Not providing keys for list items.
Solution: `./code/pitfall-missing-keys.jsx`

### Pitfall 3: Binding Issues
this context problems in event handlers.
Solution: `./code/pitfall-binding.jsx`

### Pitfall 4: setState Timing
Misunderstanding asynchronous state updates.
Solution: `./code/pitfall-setstate-timing.jsx`

## Developer Tools

### React DevTools
Browser extension for debugging React.

DevTools guide: `./code/devtools-usage.jsx`

### Profiling
Measuring component performance.

Profiling examples: `./code/profiling-examples.jsx`

## Best Practices

### DO:
- Use functional components with hooks
- Keep components small and focused
- Use meaningful names for props and state
- Handle errors gracefully
- Follow React naming conventions

### DON'T:
- Mutate state directly
- Use array indices as keys
- Call hooks conditionally
- Forget to clean up subscriptions
- Over-optimize prematurely

## React 18 Features

### Concurrent Features
New concurrent rendering capabilities.

Concurrent examples: `./code/concurrent-features.jsx`

### Automatic Batching
Improved state update batching.

Batching examples: `./code/automatic-batching.jsx`

### Suspense Improvements
Enhanced loading state management.

Suspense patterns: `./code/suspense-patterns.jsx`

## Common Interview Mistakes

### Conceptual Errors
- Not understanding virtual DOM benefits
- Confusing props and state
- Missing component lifecycle concepts
- Not knowing reconciliation process

### Implementation Errors
- Direct state mutations
- Incorrect event handler binding
- Missing cleanup in effects
- Poor component structure

### Performance Issues
- Unnecessary re-renders
- Missing memoization opportunities
- Inefficient list rendering
- Over-fetching data

## Practice Problems

1. Build todo app with full CRUD operations
2. Create reusable modal component
3. Implement infinite scroll component
4. Build form validation system
5. Create component library with consistent API

## Related Topics

- [React Hooks](../hooks/README.md)
- [React Performance](../performance/README.md)
- [Component Patterns](../patterns/README.md)
- [State Management](../state-management/README.md)
- [React Testing](../testing/README.md)