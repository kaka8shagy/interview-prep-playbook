# Content Generation Rules

## File Standards

### Length Restrictions
- **Maximum 300-400 lines per markdown file**
- Break longer topics into multiple focused files
- Use clear file naming to show relationships (e.g., `event-loop-basics.md`, `event-loop-advanced.md`)
- If approaching limit, split into logical sub-topics

### Code Separation Rules
- **NO code blocks inside markdown files**
- Store all code in separate files with proper extensions
- Reference code files using relative paths
- Code file naming: `descriptive-name.js`, `example-1.py`, `solution.sql`
- Exception: Single-line examples for syntax reference only
- Exception: Code blocks up to 10 lines may be included inline for simple examples

### File Naming Conventions
- Use kebab-case for all files and directories
- Descriptive names that indicate content
- Code files: `feature-name.ext`
- Markdown files: `concept-name.md`
- Test files: `feature-name.test.ext`

## Markdown Structure Rules

1. Every markdown file starts with single H1 (#) title
2. Use H2 (##) for main sections
3. Use H3 (###) for subsections
4. Reference code files: `See: ./code/example.js`
5. Include "Quick Summary" section at the top
6. End with "Related Topics" section for cross-referencing

## Content Templates

### Topic Template (Max 400 lines)
```
# [Topic Title]

## Quick Summary
- Bullet point 1
- Bullet point 2
- Bullet point 3-5

## Core Concepts
[Explanation without code]

## Implementation
See code examples:
- Basic: `./code/basic-example.js`
- Advanced: `./code/advanced-example.js`

## Common Pitfalls
- Pitfall 1
- Pitfall 2

## Interview Questions
1. Question 1
   - Approach: [explanation]
   - Solution: `./code/solution-1.js`

## Related Topics
- [Link to related topic](../related/topic.md)
```

### System Design Template (Max 400 lines)
```
# Design [System Name]

## Requirements
### Functional Requirements
- Requirement 1
- Requirement 2

### Non-Functional Requirements
- Scale: X users
- Latency: < Xms

## High-Level Design
See architecture diagram: `./diagrams/high-level.txt`

## Detailed Components
### Component 1
Description and responsibilities

## Database Schema
See schema: `./sql/schema.sql`

## API Design
See API spec: `./api/endpoints.yaml`

## Algorithms
- Algorithm 1: `./code/algorithm-1.js`
- Algorithm 2: `./code/algorithm-2.py`

## Scale Calculations
[Calculations in text]

## Trade-offs
- Option A vs Option B

## Follow-up Questions
- Question 1
- Question 2

## Related Topics
- [Related system](./related-system.md)
```

### Coding Problem Template (Max 300 lines)
```
# [Problem Name]

## Problem Statement
[Clear problem description]

## Input/Output
- Input: [format]
- Output: [format]

## Examples
Example 1:
- Input: [example]
- Output: [example]

## Clarifying Questions
1. Question about constraints
2. Question about edge cases

## Solution Approach
### Approach 1: [Name]
[Text explanation only]
- Time: O(n)
- Space: O(1)
- Implementation: `./code/solution-1.js`

### Approach 2: [Name]
[Text explanation only]
- Time: O(n log n)
- Space: O(n)
- Implementation: `./code/solution-2.js`

## Test Cases
See test file: `./code/tests.js`

## Similar Problems
- [Problem 1](../similar/problem-1.md)
```

## Code File Organization

### Directory Structure per Topic
```
topic-name/
├── README.md (main content, max 400 lines)
├── code/
│   ├── example-basic.js
│   ├── example-advanced.js
│   ├── solution.js
│   └── tests.js
├── diagrams/
│   └── architecture.txt (ASCII)
├── sql/
│   └── schema.sql
└── related/
    └── variations.md
```

### Code File Standards
```javascript
/**
 * File: example-basic.js
 * Description: Basic implementation of [feature]
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// Implementation here
function example() {
  // Code with comments
}

// Example usage
console.log(example(input));

// Export for testing
module.exports = { example };
```

## Reference Format

### Referencing Code
```markdown
## Implementation

For the complete implementation, see:
- Basic approach: `./code/solution-basic.js`
- Optimized version: `./code/solution-optimized.js`
- Test cases: `./code/tests.js`

Key points about the implementation:
- Uses dynamic programming
- Handles edge cases X, Y, Z
```

### Referencing Diagrams
```markdown
## Architecture

System architecture: `./diagrams/system-architecture.txt`

The diagram shows:
- Component relationships
- Data flow direction
- External dependencies
```

### Referencing SQL
```markdown
## Database Design

Schema definition: `./sql/schema.sql`
Migration scripts: `./sql/migrations/`

Key design decisions:
- Normalized to 3NF
- Indexes on foreign keys
```

## Quality Checklist

Before adding content:
- [ ] Markdown file under 400 lines
- [ ] All code in separate files
- [ ] Code files properly referenced with relative paths
- [ ] Follows naming conventions (kebab-case)
- [ ] Uses correct template structure
- [ ] Includes proper file references
- [ ] Cross-references verified and working
- [ ] Code files are runnable and tested
- [ ] Diagrams in separate .txt files

## File Splitting Guidelines

When a topic exceeds 400 lines, split as follows:

### Example Structure
```
event-loop/
├── README.md (index and overview, <200 lines)
├── basics.md (<400 lines)
├── advanced-patterns.md (<400 lines)
├── common-pitfalls.md (<300 lines)
├── interview-questions.md (<400 lines)
├── code/
│   ├── basic-example.js
│   ├── advanced-example.js
│   ├── promise-puzzle.js
│   └── solutions/
│       ├── question-1.js
│       └── question-2.js
└── diagrams/
    └── event-loop-architecture.txt
```

### Splitting Rules
1. Keep logical cohesion
2. Each file self-contained
3. Clear navigation in README
4. Shared code in common folder
5. Related files in same directory

## Diagram Standards

### ASCII Diagram Rules
- Store in `.txt` files
- Maximum 80 characters width
- Use standard ASCII characters
- Clear labels and legends

### Example
```
File: ./diagrams/architecture.txt

┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │
└─────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Database  │
                    └─────────────┘
```

## Cross-Reference Rules

### Format
- Use relative paths: `../topic/file.md`
- Link to specific sections: `../topic/file.md#section`
- Verify links before committing
- Maintain bidirectional links

### Example
```markdown
## Related Topics
- [Event Loop Basics](../javascript-core/event-loop-basics.md)
- [Promises](../javascript-core/promises.md#chaining)
- See also: [Async Patterns](../patterns/async.md)
```

## Language-Specific Guidelines

### JavaScript/TypeScript
- `.js` or `.ts` extension
- Use ES6+ syntax
- Include `module.exports` or `export`

### Python
- `.py` extension
- Include `if __name__ == "__main__":`
- Type hints where helpful

### SQL
- `.sql` extension
- Include comments for complex queries
- Separate DDL and DML

### Bash
- `.sh` extension
- Include shebang: `#!/bin/bash`
- Make executable in instructions