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
    if (event.target === element && event.propertyName === property) {
      element.removeEventListener('transitionend', handleTransitionEnd);
      if (onComplete) onComplete();
    }
  };
  
  element.addEventListener('transitionend', handleTransitionEnd);
  
  // Fallback timeout in case transitionend doesn't fire
  setTimeout(() => {
    element.removeEventListener('transitionend', handleTransitionEnd);
    if (onComplete) onComplete();
  }, duration + 50);
}

// =======================
// Approach 2: Advanced Animation Sequencer
// =======================

/**
 * Advanced animation sequencer with multiple animation types
 * Supports complex timing patterns and chaining
 */
class AnimationSequencer {
  constructor() {
    this.animations = [];
    this.isPlaying = false;
    this.currentIndex = 0;
  }
  
  /**
   * Add animation step to sequence
   */
  add(elements, animationType, options = {}) {
    this.animations.push({
      elements: Array.isArray(elements) ? elements : [elements],
      type: animationType,
      options
    });
    return this; // For chaining
  }
  
  /**
   * Play the animation sequence
   */
  async play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentIndex = 0;
    
    for (let i = 0; i < this.animations.length; i++) {
      this.currentIndex = i;
      await this.playStep(this.animations[i]);
    }
    
    this.isPlaying = false;
  }
  
  /**
   * Play single animation step
   */
  async playStep(step) {
    const { elements, type, options } = step;
    
    switch (type) {
      case 'fadeIn':
        return this.fadeIn(elements, options);
      case 'slideIn':
        return this.slideIn(elements, options);
      case 'scale':
        return this.scale(elements, options);
      case 'rotate':
        return this.rotate(elements, options);
      case 'parallel':
        return this.parallel(elements, options);
      case 'stagger':
        return this.stagger(elements, options);
      default:
        return this.customAnimation(elements, options);
    }
  }
  
  /**
   * Fade in animation
   */
  fadeIn(elements, options = {}) {
    const { duration = 300, delay = 0 } = options;
    
    return new Promise(resolve => {
      setTimeout(() => {
        animateSequence(elements, {
          duration,
          property: 'opacity',
          from: 0,
          to: 1,
          onComplete: resolve
        });
      }, delay);
    });
  }
  
  /**
   * Slide in animation
   */
  slideIn(elements, options = {}) {
    const { duration = 300, direction = 'left', distance = 100 } = options;
    
    const transforms = {
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
      up: `translateY(-${distance}px)`,
      down: `translateY(${distance}px)`
    };
    
    return new Promise(resolve => {
      elements.forEach(element => {
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
      });
      
      setTimeout(() => {
        elements.forEach(element => {
          element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
          element.style.transform = 'translateX(0) translateY(0)';
          element.style.opacity = '1';
        });
        
        setTimeout(resolve, duration);
      }, 10);
    });
  }
  
  /**
   * Scale animation
   */
  scale(elements, options = {}) {
    const { duration = 300, from = 0, to = 1 } = options;
    
    return new Promise(resolve => {
      elements.forEach(element => {
        element.style.transform = `scale(${from})`;
        element.style.transition = `transform ${duration}ms ease`;
        
        setTimeout(() => {
          element.style.transform = `scale(${to})`;
        }, 10);
      });
      
      setTimeout(resolve, duration);
    });
  }
  
  /**
   * Rotate animation
   */
  rotate(elements, options = {}) {
    const { duration = 300, degrees = 360 } = options;
    
    return new Promise(resolve => {
      elements.forEach(element => {
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `rotate(${degrees}deg)`;
      });
      
      setTimeout(resolve, duration);
    });
  }
  
  /**
   * Parallel animation (all elements at once)
   */
  parallel(elements, options = {}) {
    const { animations } = options;
    
    return Promise.all(
      animations.map(anim => 
        this.playStep({ elements, type: anim.type, options: anim.options })
      )
    );
  }
  
  /**
   * Staggered animation with custom timing
   */
  stagger(elements, options = {}) {
    const { staggerDelay = 100, animationType = 'fadeIn' } = options;
    
    return new Promise(resolve => {
      let completed = 0;
      
      elements.forEach((element, index) => {
        setTimeout(async () => {
          await this.playStep({
            elements: [element],
            type: animationType,
            options
          });
          
          completed++;
          if (completed === elements.length) {
            resolve();
          }
        }, index * staggerDelay);
      });
    });
  }
  
  /**
   * Stop current animation sequence
   */
  stop() {
    this.isPlaying = false;
    // Additional cleanup logic here
  }
  
  /**
   * Reset all elements to initial state
   */
  reset(elements) {
    elements.forEach(element => {
      element.style.transition = '';
      element.style.transform = '';
      element.style.opacity = '';
    });
  }
}

// =======================
// Approach 3: Performance-Optimized Animations
// =======================

/**
 * High-performance animation using requestAnimationFrame
 * Avoids layout thrashing and provides smooth 60fps animations
 */
function animateSequenceRAF(elements, options = {}) {
  const {
    duration = 300,
    delay = 100,
    easing = 'easeOutQuart',
    onProgress = null,
    onComplete = null
  } = options;
  
  const easingFunctions = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutQuart: t => 1 - (--t) * t * t * t
  };
  
  const easingFn = easingFunctions[easing] || easingFunctions.easeOutQuart;
  let startTime = null;
  let completedAnimations = 0;
  
  elements.forEach((element, index) => {
    setTimeout(() => {
      startElementAnimation(element, {
        duration,
        easingFn,
        onProgress,
        onComplete: () => {
          completedAnimations++;
          if (completedAnimations === elements.length && onComplete) {
            onComplete();
          }
        }
      });
    }, index * delay);
  });
}

/**
 * Animate single element with RAF
 */
function startElementAnimation(element, { duration, easingFn, onProgress, onComplete }) {
  let startTime = null;
  const initialOpacity = parseFloat(getComputedStyle(element).opacity) || 0;
  
  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);
    
    // Update element properties
    element.style.opacity = initialOpacity + (1 - initialOpacity) * easedProgress;
    
    if (onProgress) {
      onProgress(element, progress, easedProgress);
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (onComplete) onComplete();
    }
  }
  
  requestAnimationFrame(animate);
}

// =======================
// Real-world Examples and Utilities
// =======================

/**
 * Animate list items appearing one by one
 */
function animateListItems(listSelector, options = {}) {
  const list = document.querySelector(listSelector);
  if (!list) return;
  
  const items = list.querySelectorAll('li');
  const { staggerDelay = 100, ...animOptions } = options;
  
  // Hide all items initially
  items.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
  });
  
  // Animate them in
  const sequencer = new AnimationSequencer();
  sequencer.add(items, 'stagger', {
    staggerDelay,
    animationType: 'slideIn',
    direction: 'up',
    distance: 20,
    ...animOptions
  });
  
  return sequencer.play();
}

/**
 * Animate cards in a grid layout
 */
function animateCardGrid(gridSelector, options = {}) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;
  
  const cards = grid.querySelectorAll('.card');
  const { wave = true, ...animOptions } = options;
  
  if (wave) {
    // Wave effect - animate by position
    const cardPositions = Array.from(cards).map(card => {
      const rect = card.getBoundingClientRect();
      return { card, x: rect.left, y: rect.top };
    });
    
    cardPositions.sort((a, b) => a.x + a.y - (b.x + b.y));
    
    animateSequence(cardPositions.map(p => p.card), {
      delay: 50,
      duration: 200,
      property: 'transform',
      from: 'scale(0)',
      to: 'scale(1)',
      ...animOptions
    });
  } else {
    // Simple sequence
    animateSequence(cards, animOptions);
  }
}

// Export for use in other modules
module.exports = {
  animateSequence,
  animateElement,
  AnimationSequencer,
  animateSequenceRAF,
  startElementAnimation,
  animateListItems,
  animateCardGrid
};