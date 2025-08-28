/**
 * File: async-generators.js
 * Description: Async generators for handling async iteration
 */

// Basic async generator
async function* asyncBasic() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

// Using async generator
async function demonstrateAsyncBasic() {
  console.log('=== Basic Async Generator ===');
  for await (const value of asyncBasic()) {
    console.log(value);
  }
}

// Async generator with delays
async function* delayedSequence() {
  for (let i = 1; i <= 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i;
  }
}

// Fetching data with async generators
async function* fetchUserData(userIds) {
  for (const id of userIds) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      yield { id, name: `User ${id}`, email: `user${id}@example.com` };
    } catch (error) {
      yield { id, error: error.message };
    }
  }
}

async function demonstrateFetchData() {
  console.log('\n=== Fetching User Data ===');
  for await (const user of fetchUserData([1, 2, 3])) {
    console.log(user);
  }
}

// Streaming data processor
async function* processStream(source) {
  for await (const chunk of source) {
    // Process each chunk
    const processed = chunk.toUpperCase();
    yield processed;
  }
}

// Mock data stream
async function* dataStream() {
  const data = ['hello', 'world', 'async', 'generators'];
  for (const item of data) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield item;
  }
}

async function demonstrateStreaming() {
  console.log('\n=== Streaming Data Processor ===');
  const processed = processStream(dataStream());
  for await (const item of processed) {
    console.log(item);
  }
}

// Pagination with async generators
async function* paginatedFetch(baseUrl, pageSize = 10) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = {
        items: Array.from({ length: pageSize }, (_, i) => ({
          id: (page - 1) * pageSize + i + 1,
          data: `Item ${(page - 1) * pageSize + i + 1}`
        })),
        hasMore: page < 3 // Simulate only 3 pages
      };

      yield data.items;
      hasMore = data.hasMore;
      page++;
    } catch (error) {
      throw new Error(`Failed to fetch page ${page}: ${error.message}`);
    }
  }
}

async function demonstratePagination() {
  console.log('\n=== Paginated Fetch ===');
  try {
    for await (const page of paginatedFetch('/api/items', 5)) {
      console.log(`Page with ${page.length} items:`, page);
    }
  } catch (error) {
    console.error('Pagination error:', error.message);
  }
}

// Error handling in async generators
async function* errorProneGenerator() {
  yield 1;
  yield 2;
  throw new Error('Something went wrong');
  yield 3; // This will never be reached
}

async function demonstrateErrorHandling() {
  console.log('\n=== Error Handling ===');
  try {
    for await (const value of errorProneGenerator()) {
      console.log(value);
    }
  } catch (error) {
    console.error('Caught error:', error.message);
  }
}

// Async generator with cleanup
async function* resourceGenerator() {
  const resource = { id: 'resource-1', active: true };
  console.log('Resource acquired:', resource.id);
  
  try {
    yield resource;
    yield { ...resource, data: 'some data' };
  } finally {
    // Cleanup
    resource.active = false;
    console.log('Resource cleaned up:', resource.id);
  }
}

async function demonstrateCleanup() {
  console.log('\n=== Resource Cleanup ===');
  const gen = resourceGenerator();
  
  try {
    const result1 = await gen.next();
    console.log('First result:', result1.value);
    
    const result2 = await gen.next();
    console.log('Second result:', result2.value);
  } finally {
    await gen.return(); // Triggers cleanup
  }
}

// Run demonstrations
async function runAll() {
  await demonstrateAsyncBasic();
  await demonstrateFetchData();
  await demonstrateStreaming();
  await demonstratePagination();
  await demonstrateErrorHandling();
  await demonstrateCleanup();
}

module.exports = {
  asyncBasic,
  delayedSequence,
  fetchUserData,
  processStream,
  dataStream,
  paginatedFetch,
  errorProneGenerator,
  resourceGenerator,
  runAll
};