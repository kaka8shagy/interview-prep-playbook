# Merge Intervals

## Quick Summary
- Pattern for problems involving overlapping intervals
- Sort intervals by start time, then merge overlapping ones
- Common applications: meeting scheduling, calendar conflicts, range merging
- Key insight: if intervals are sorted, only need to check adjacent intervals
- Time complexity: O(n log n) due to sorting, Space complexity: O(n) for result

## Core Concepts

### Interval Representation
Typically represented as [start, end] arrays or objects with start/end properties.

### Overlap Detection
Two intervals [a, b] and [c, d] overlap if: max(a, c) <= min(b, d)

### Merge Strategy
1. Sort intervals by start time
2. Initialize with first interval
3. For each subsequent interval, merge if overlapping, otherwise add new interval

## Implementation Patterns
See code examples:
- Basic merging: `./code/merge-intervals.js`
- Insertion: `./code/insert-interval.js`
- Meeting rooms: `./code/meeting-rooms.js`

## Common Pitfalls
- Not sorting intervals first
- Incorrect overlap detection logic
- Edge cases with empty intervals
- Off-by-one errors in boundary conditions
- Not handling single interval cases

## Interview Questions

### 1. Merge Intervals
**Approach**: Sort by start time, merge overlapping intervals
**Solution**: `./code/merge-intervals.js`

### 2. Meeting Rooms
**Approach**: Sort intervals, check for any overlap
**Solution**: `./code/meeting-rooms.js`

### 3. Interval List Intersections
**Approach**: Two pointers to find intersections
**Solution**: `./code/interval-intersections.js`

### 4. Insert Interval
**Approach**: Find position, merge with overlapping intervals
**Solution**: `./code/insert-interval.js`

### 5. Meeting Rooms II
**Approach**: Count concurrent meetings using start/end times
**Solution**: `./code/meeting-rooms-ii.js`

### 6. Meeting Scheduler
**Approach**: Find intersection of free time slots
**Solution**: `./code/meeting-scheduler.js`

### 7. Non-overlapping Intervals
**Approach**: Greedy approach, remove minimum intervals
**Solution**: `./code/non-overlapping-intervals.js`

### 8. Employee Free Time
**Approach**: Merge all busy times, find gaps
**Solution**: `./code/employee-free-time.js`

## Related Topics
- [Arrays and Strings](../arrays-and-strings/README.md) - Interval representation
- [Sorting](../sorting/README.md) - Core technique used
- [Two Pointers](../two-pointers/README.md) - For intersection problems