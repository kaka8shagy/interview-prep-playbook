# Interview Prep Playbook

A comprehensive markdown-based knowledge base for staff/architect level full stack engineer interview preparation.

## Quick Start

This playbook is organized by technical domains. Start with the area most relevant to your upcoming interviews:

- **[Frontend](./frontend/)** - JavaScript deep dive, React patterns, performance optimization
- **[Backend](./backend/)** - Node.js, API design, databases, microservices
- **[System Design](./system-design/)** - Scalability, architecture patterns, case studies
- **[Coding Problems](./coding-problems/)** - Algorithms, data structures, implementation challenges
- **[Behavioral](./behavioral/)** - Leadership, conflict resolution, project experiences
- **[Interview Experiences](./interview-experiences/)** - Company-specific questions and patterns

## Learning Paths

### 🎯 For Senior Engineers → Staff/Architect

1. **Week 1-2: System Design Fundamentals**
   - [Scalability Basics](./system-design/fundamentals/scalability.md)
   - [Caching Strategies](./system-design/fundamentals/caching.md)
   - [Load Balancing](./system-design/fundamentals/load-balancing.md)

2. **Week 3-4: Architecture Patterns**
   - [Microservices vs Monoliths](./backend/microservices/patterns.md)
   - [Event-Driven Architecture](./backend/microservices/communication.md)
   - [API Design Best Practices](./backend/api-design/rest-best-practices.md)

3. **Week 5-6: Case Studies**
   - [Design Twitter](./system-design/case-studies/design-twitter.md)
   - [Design Uber](./system-design/case-studies/design-uber.md)
   - [Design Netflix](./system-design/case-studies/design-netflix.md)

4. **Week 7-8: Leadership & Behavioral**
   - [Technical Leadership](./behavioral/leadership.md)
   - [Conflict Resolution](./behavioral/conflict-resolution.md)
   - [Project Failures](./behavioral/project-failures.md)

### 🚀 For Full Stack Depth

1. **Frontend Mastery**
   - [JavaScript Event Loop](./frontend/javascript-core/event-loop.md)
   - [React Performance](./frontend/react/performance.md)
   - [State Management Patterns](./frontend/state-management/)

2. **Backend Excellence**
   - [Node.js Internals](./backend/node-fundamentals/)
   - [Database Optimization](./backend/databases/sql-optimization.md)
   - [Microservices Patterns](./backend/microservices/)

3. **Full Stack Integration**
   - [SSR/SSG Strategies](./frontend/react/server-components.md)
   - [Real-time Features](./backend/api-design/websockets.md)
   - [Performance Across Stack](./frontend/performance/)

## Directory Structure

```
interview-prep-playbook/
├── frontend/                # Frontend technologies and patterns
│   ├── javascript-core/     # JS fundamentals, event loop, async
│   ├── react/               # Hooks, performance, patterns
│   ├── state-management/    # Redux, Context, Zustand
│   └── performance/         # Web vitals, optimization
│
├── backend/                 # Backend technologies and patterns
│   ├── node-fundamentals/   # Event loop, streams, clustering
│   ├── api-design/          # REST, GraphQL, WebSockets
│   ├── databases/           # SQL, NoSQL, optimization
│   └── microservices/       # Patterns, communication
│
├── system-design/           # System architecture and design
│   ├── fundamentals/        # Scaling, caching, load balancing
│   ├── case-studies/        # Real-world system designs
│   └── diagrams/            # Architecture diagrams
│
├── coding-problems/         # Interview coding challenges
│   ├── algorithms/          # DP, graphs, sorting
│   ├── frontend-challenges/ # DOM, async, components
│   └── system-implementation/ # Rate limiter, cache
│
├── behavioral/              # Non-technical interview prep
│   └── *.md                 # Leadership, conflicts, failures
│
└── interview-experiences/   # Company-specific insights
    ├── faang/              # Google, Meta, Amazon, etc.
    └── startups/           # Startup interview patterns
```

## How to Use This Playbook

1. **Assessment**: Start by identifying your weak areas
2. **Focused Study**: Deep dive into specific topics
3. **Practice**: Work through coding problems and system designs
4. **Mock Interviews**: Use the case studies for practice sessions
5. **Review**: Check interview experiences for company-specific prep

## Key Topics by Interview Type

### System Design Interviews
- [Distributed Systems Fundamentals](./system-design/fundamentals/)
- [Database Design & Scaling](./backend/databases/)
- [Caching Strategies](./system-design/fundamentals/caching.md)
- [Real-world Case Studies](./system-design/case-studies/)

### Coding Interviews
- [JavaScript Advanced Concepts](./frontend/javascript-core/)
- [Algorithm Patterns](./coding-problems/algorithms/)
- [Frontend Challenges](./coding-problems/frontend-challenges/)
- [System Implementation](./coding-problems/system-implementation/)

### Behavioral Interviews
- [Leadership Scenarios](./behavioral/leadership.md)
- [Technical Decision Making](./behavioral/technical-decisions.md)
- [Conflict Resolution](./behavioral/conflict-resolution.md)
- [Project Failures & Learnings](./behavioral/project-failures.md)

### Architecture Interviews
- [Microservices Design](./backend/microservices/)
- [API Design Patterns](./backend/api-design/)
- [Frontend Architecture](./frontend/react/server-components.md)
- [Performance Optimization](./frontend/performance/)

## Quick Reference

### Most Important Topics for Staff/Architect Level

1. **System Design Must-Knows**
   - CAP Theorem and trade-offs
   - Consistent hashing
   - Database sharding strategies
   - Message queue patterns
   - Caching layers (CDN, Redis, Memcached)

2. **Architecture Decisions**
   - Monolith vs Microservices trade-offs
   - Synchronous vs Asynchronous communication
   - SQL vs NoSQL selection criteria
   - Event sourcing and CQRS

3. **Leadership & Influence**
   - Technical strategy development
   - Cross-team collaboration
   - Mentoring and growth
   - Technical debt management

## Contributing

See [CLAUDE.md](./CLAUDE.md) for implementation guidelines and content standards.

## Navigation Tips

- Use your editor's file search to quickly find topics
- Each directory has its own README with detailed navigation
- Cross-references link related topics
- Code snippets are in separate files for easy testing

## Resources

- Implementation guide: [CLAUDE.md](./CLAUDE.md)
- Content templates and standards
- Learning path recommendations
- Quality checklist for contributions

---

*Start with the section most relevant to your upcoming interviews. Good luck! 🚀*