/**
 * File: animate-sequence.js
 * Description: Animate elements in sequence with various timing and easing options
 * 
 * Learning objectives:
 * - Understand animation sequencing and timing
 * - Learn DOM animation techniques and optimization
 * - See performance considerations for complex animations
 * 
 * Time Complexity: O(n) where n is number of elements
 * Space Complexity: O(n) for animation state tracking
 */

// =======================
// Approach 1: Basic Sequential Animation
// =======================

/**
 * Animate elements one after another with configurable delays
 * Uses CSS transitions for smooth performance
 */
function animateSequence(elements, options = {}) {
  const {
    duration = 300,
    delay = 100,
    easing = 'ease',
    property = 'opacity',
    from = 0,
    to = 1,
    onComplete = null,
    onElementComplete = null
  } = options;
  
  if (!Array.isArray(elements)) {
    elements = Array.from(elements);
  }
  
  let completedCount = 0;
  const totalElements = elements.length;
  
  elements.forEach((element, index) => {
    setTimeout(() => {
      animateElement(element, {
        duration,
        easing,
        property,
        from,
        to,
        onComplete: () => {
          completedCount++;
          if (onElementComplete) {
            onElementComplete(element, index, completedCount);
          }
          
          // Check if all animations are complete
          if (completedCount === totalElements && onComplete) {
            onComplete();
          }
        }
      });
    }, index * delay);
  });
}

/**
 * Animate single element with CSS transitions
 */
function animateElement(element, options) {
  const { duration, easing, property, from, to, onComplete } = options;
  
  // Set initial state
  element.style[property] = from;
  element.style.transition = `${property} ${duration}ms ${easing}`;
  
  // Force reflow to ensure initial state is applied
  element.offsetHeight;
  
  // Set final state
  element.style[property] = to;
  
  // Handle completion
  const handleTransitionEnd = (event) => {
    if (event.target === element && event.propertyName === property) {\n      element.removeEventListener('transitionend', handleTransitionEnd);\n      if (onComplete) onComplete();\n    }\n  };\n  \n  element.addEventListener('transitionend', handleTransitionEnd);\n  \n  // Fallback timeout in case transitionend doesn't fire\n  setTimeout(() => {\n    element.removeEventListener('transitionend', handleTransitionEnd);\n    if (onComplete) onComplete();\n  }, duration + 50);\n}\n\n// =======================\n// Approach 2: Advanced Animation Sequencer\n// =======================\n\n/**\n * Advanced animation sequencer with multiple animation types\n * Supports complex timing patterns and chaining\n */\nclass AnimationSequencer {\n  constructor() {\n    this.animations = [];\n    this.isPlaying = false;\n    this.currentIndex = 0;\n  }\n  \n  /**\n   * Add animation step to sequence\n   */\n  add(elements, animationType, options = {}) {\n    this.animations.push({\n      elements: Array.isArray(elements) ? elements : [elements],\n      type: animationType,\n      options\n    });\n    return this; // For chaining\n  }\n  \n  /**\n   * Play the animation sequence\n   */\n  async play() {\n    if (this.isPlaying) return;\n    \n    this.isPlaying = true;\n    this.currentIndex = 0;\n    \n    for (let i = 0; i < this.animations.length; i++) {\n      this.currentIndex = i;\n      await this.playStep(this.animations[i]);\n    }\n    \n    this.isPlaying = false;\n  }\n  \n  /**\n   * Play single animation step\n   */\n  async playStep(step) {\n    const { elements, type, options } = step;\n    \n    switch (type) {\n      case 'fadeIn':\n        return this.fadeIn(elements, options);\n      case 'slideIn':\n        return this.slideIn(elements, options);\n      case 'scale':\n        return this.scale(elements, options);\n      case 'rotate':\n        return this.rotate(elements, options);\n      case 'parallel':\n        return this.parallel(elements, options);\n      case 'stagger':\n        return this.stagger(elements, options);\n      default:\n        return this.customAnimation(elements, options);\n    }\n  }\n  \n  /**\n   * Fade in animation\n   */\n  fadeIn(elements, options = {}) {\n    const { duration = 300, delay = 0 } = options;\n    \n    return new Promise(resolve => {\n      setTimeout(() => {\n        animateSequence(elements, {\n          duration,\n          property: 'opacity',\n          from: 0,\n          to: 1,\n          onComplete: resolve\n        });\n      }, delay);\n    });\n  }\n  \n  /**\n   * Slide in animation\n   */\n  slideIn(elements, options = {}) {\n    const { duration = 300, direction = 'left', distance = 100 } = options;\n    \n    const transforms = {\n      left: `translateX(-${distance}px)`,\n      right: `translateX(${distance}px)`,\n      up: `translateY(-${distance}px)`,\n      down: `translateY(${distance}px)`\n    };\n    \n    return new Promise(resolve => {\n      elements.forEach(element => {\n        element.style.transform = transforms[direction];\n        element.style.opacity = '0';\n      });\n      \n      setTimeout(() => {\n        elements.forEach(element => {\n          element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;\n          element.style.transform = 'translateX(0) translateY(0)';\n          element.style.opacity = '1';\n        });\n        \n        setTimeout(resolve, duration);\n      }, 10);\n    });\n  }\n  \n  /**\n   * Scale animation\n   */\n  scale(elements, options = {}) {\n    const { duration = 300, from = 0, to = 1 } = options;\n    \n    return new Promise(resolve => {\n      elements.forEach(element => {\n        element.style.transform = `scale(${from})`;\n        element.style.transition = `transform ${duration}ms ease`;\n        \n        setTimeout(() => {\n          element.style.transform = `scale(${to})`;\n        }, 10);\n      });\n      \n      setTimeout(resolve, duration);\n    });\n  }\n  \n  /**\n   * Rotate animation\n   */\n  rotate(elements, options = {}) {\n    const { duration = 300, degrees = 360 } = options;\n    \n    return new Promise(resolve => {\n      elements.forEach(element => {\n        element.style.transition = `transform ${duration}ms ease`;\n        element.style.transform = `rotate(${degrees}deg)`;\n      });\n      \n      setTimeout(resolve, duration);\n    });\n  }\n  \n  /**\n   * Parallel animation (all elements at once)\n   */\n  parallel(elements, options = {}) {\n    const { animations } = options;\n    \n    return Promise.all(\n      animations.map(anim => \n        this.playStep({ elements, type: anim.type, options: anim.options })\n      )\n    );\n  }\n  \n  /**\n   * Staggered animation with custom timing\n   */\n  stagger(elements, options = {}) {\n    const { staggerDelay = 100, animationType = 'fadeIn' } = options;\n    \n    return new Promise(resolve => {\n      let completed = 0;\n      \n      elements.forEach((element, index) => {\n        setTimeout(async () => {\n          await this.playStep({\n            elements: [element],\n            type: animationType,\n            options\n          });\n          \n          completed++;\n          if (completed === elements.length) {\n            resolve();\n          }\n        }, index * staggerDelay);\n      });\n    });\n  }\n  \n  /**\n   * Stop current animation sequence\n   */\n  stop() {\n    this.isPlaying = false;\n    // Additional cleanup logic here\n  }\n  \n  /**\n   * Reset all elements to initial state\n   */\n  reset(elements) {\n    elements.forEach(element => {\n      element.style.transition = '';\n      element.style.transform = '';\n      element.style.opacity = '';\n    });\n  }\n}\n\n// =======================\n// Approach 3: Performance-Optimized Animations\n// =======================\n\n/**\n * High-performance animation using requestAnimationFrame\n * Avoids layout thrashing and provides smooth 60fps animations\n */\nfunction animateSequenceRAF(elements, options = {}) {\n  const {\n    duration = 300,\n    delay = 100,\n    easing = 'easeOutQuart',\n    onProgress = null,\n    onComplete = null\n  } = options;\n  \n  const easingFunctions = {\n    linear: t => t,\n    easeInQuad: t => t * t,\n    easeOutQuad: t => t * (2 - t),\n    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,\n    easeOutQuart: t => 1 - (--t) * t * t * t\n  };\n  \n  const easingFn = easingFunctions[easing] || easingFunctions.easeOutQuart;\n  let startTime = null;\n  let completedAnimations = 0;\n  \n  elements.forEach((element, index) => {\n    setTimeout(() => {\n      startElementAnimation(element, {\n        duration,\n        easingFn,\n        onProgress,\n        onComplete: () => {\n          completedAnimations++;\n          if (completedAnimations === elements.length && onComplete) {\n            onComplete();\n          }\n        }\n      });\n    }, index * delay);\n  });\n}\n\n/**\n * Animate single element with RAF\n */\nfunction startElementAnimation(element, { duration, easingFn, onProgress, onComplete }) {\n  let startTime = null;\n  const initialOpacity = parseFloat(getComputedStyle(element).opacity) || 0;\n  \n  function animate(currentTime) {\n    if (!startTime) startTime = currentTime;\n    const elapsed = currentTime - startTime;\n    const progress = Math.min(elapsed / duration, 1);\n    const easedProgress = easingFn(progress);\n    \n    // Update element properties\n    element.style.opacity = initialOpacity + (1 - initialOpacity) * easedProgress;\n    \n    if (onProgress) {\n      onProgress(element, progress, easedProgress);\n    }\n    \n    if (progress < 1) {\n      requestAnimationFrame(animate);\n    } else {\n      if (onComplete) onComplete();\n    }\n  }\n  \n  requestAnimationFrame(animate);\n}\n\n// =======================\n// Real-world Examples and Utilities\n// =======================\n\n/**\n * Animate list items appearing one by one\n */\nfunction animateListItems(listSelector, options = {}) {\n  const list = document.querySelector(listSelector);\n  if (!list) return;\n  \n  const items = list.querySelectorAll('li');\n  const { staggerDelay = 100, ...animOptions } = options;\n  \n  // Hide all items initially\n  items.forEach(item => {\n    item.style.opacity = '0';\n    item.style.transform = 'translateY(20px)';\n  });\n  \n  // Animate them in\n  const sequencer = new AnimationSequencer();\n  sequencer.add(items, 'stagger', {\n    staggerDelay,\n    animationType: 'slideIn',\n    direction: 'up',\n    distance: 20,\n    ...animOptions\n  });\n  \n  return sequencer.play();\n}\n\n/**\n * Animate cards in a grid layout\n */\nfunction animateCardGrid(gridSelector, options = {}) {\n  const grid = document.querySelector(gridSelector);\n  if (!grid) return;\n  \n  const cards = grid.querySelectorAll('.card');\n  const { wave = true, ...animOptions } = options;\n  \n  if (wave) {\n    // Wave effect - animate by position\n    const cardPositions = Array.from(cards).map(card => {\n      const rect = card.getBoundingClientRect();\n      return { card, x: rect.left, y: rect.top };\n    });\n    \n    cardPositions.sort((a, b) => a.x + a.y - (b.x + b.y));\n    \n    animateSequence(cardPositions.map(p => p.card), {\n      delay: 50,\n      duration: 200,\n      property: 'transform',\n      from: 'scale(0)',\n      to: 'scale(1)',\n      ...animOptions\n    });\n  } else {\n    // Simple sequence\n    animateSequence(cards, animOptions);\n  }\n}\n\n// Export for use in other modules\nmodule.exports = {\n  animateSequence,\n  animateElement,\n  AnimationSequencer,\n  animateSequenceRAF,\n  startElementAnimation,\n  animateListItems,\n  animateCardGrid\n};