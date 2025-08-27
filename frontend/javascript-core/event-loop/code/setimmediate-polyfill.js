/**
 * File: setimmediate-polyfill.js
 * Description: Implementation of setImmediate polyfill using various browser APIs
 * Demonstrates understanding of microtask scheduling
 */

// Implementation 1: Using Promise microtasks
const setImmediateV1 = (function() {
  const callbacks = [];
  let processing = false;
  
  function processCallbacks() {
    processing = true;
    const currentCallbacks = callbacks.splice(0);
    currentCallbacks.forEach(cb => cb());
    processing = false;
  }
  
  return function(callback) {
    callbacks.push(callback);
    if (!processing) {
      Promise.resolve().then(processCallbacks);
    }
  };
})();

// Implementation 2: Using MessageChannel (better performance)
const setImmediateV2 = (function() {
  const channel = new MessageChannel();
  const callbacks = [];
  
  channel.port1.onmessage = () => {
    const cb = callbacks.shift();
    if (cb) cb();
  };
  
  return function(callback) {
    callbacks.push(callback);
    channel.port2.postMessage(null);
  };
})();

// Implementation 3: Using postMessage (fallback for older browsers)
const setImmediateV3 = (function() {
  const callbacks = [];
  const messageName = 'setImmediate$' + Math.random();
  
  function handleMessage(event) {
    if (event.source === window && event.data === messageName) {
      event.stopPropagation();
      if (callbacks.length > 0) {
        const cb = callbacks.shift();
        cb();
      }
    }
  }
  
  window.addEventListener('message', handleMessage, true);
  
  return function(callback) {
    callbacks.push(callback);
    window.postMessage(messageName, '*');
  };
})();

// Usage example
console.log('Start');

setImmediateV1(() => console.log('Immediate V1'));
setImmediateV2(() => console.log('Immediate V2'));
setImmediateV3(() => console.log('Immediate V3'));

Promise.resolve().then(() => console.log('Promise'));
setTimeout(() => console.log('Timeout'), 0);

console.log('End');

// Export the best available implementation
const setImmediatePolyfill = 
  (typeof MessageChannel !== 'undefined') ? setImmediateV2 :
  (typeof Promise !== 'undefined') ? setImmediateV1 :
  setImmediateV3;

module.exports = { setImmediatePolyfill, setImmediateV1, setImmediateV2, setImmediateV3 };