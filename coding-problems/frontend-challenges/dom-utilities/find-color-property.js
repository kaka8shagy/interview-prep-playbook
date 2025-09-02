/**
 * File: find-color-property.js
 * Description: Find elements with specific color properties in the DOM
 * 
 * Learning objectives:
 * - Understand computed style access and manipulation
 * - Learn color comparison and parsing techniques
 * - See performance optimization for style queries
 * 
 * Time Complexity: O(n) where n is number of elements
 * Space Complexity: O(k) where k is matching elements
 */

// =======================
// Approach 1: Basic Color Property Search
// =======================

/**
 * Find elements with specific color property values
 * Supports CSS color formats: hex, rgb, rgba, named colors
 */
function findElementsByColorProperty(colorValue, property = 'color', root = document) {
  if (!colorValue || typeof colorValue !== 'string') {
    throw new Error('Color value must be a non-empty string');
  }
  
  const normalizedTarget = normalizeColor(colorValue);
  const results = [];
  const elements = root.getElementsByTagName('*');
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const computedStyle = getComputedStyle(element);
    const elementColor = computedStyle.getPropertyValue(property);
    
    if (colorsMatch(elementColor, normalizedTarget)) {
      results.push(element);
    }
  }
  
  return results;
}

/**
 * Normalize color to RGB format for comparison
 */
function normalizeColor(color) {
  // Create temporary element to let browser parse color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  
  const computedColor = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  
  return parseRgbColor(computedColor);
}

/**
 * Parse RGB color string to object
 */
function parseRgbColor(rgbString) {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  
  if (!match) {
    return null;
  }
  
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] ? parseFloat(match[4]) : 1
  };
}

/**
 * Compare two color objects for equality
 */
function colorsMatch(color1, color2) {
  const rgb1 = typeof color1 === 'string' ? parseRgbColor(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? parseRgbColor(color2) : color2;
  
  if (!rgb1 || !rgb2) return false;
  
  return rgb1.r === rgb2.r && 
         rgb1.g === rgb2.g && 
         rgb1.b === rgb2.b &&
         Math.abs(rgb1.a - rgb2.a) < 0.01; // Float comparison with tolerance
}

// =======================
// Approach 2: Advanced Color Matching
// =======================

/**
 * Advanced color finder with fuzzy matching and multiple properties
 */
function findElementsByColorAdvanced(options = {}) {
  const {
    color,
    tolerance = 0,
    properties = ['color', 'background-color', 'border-color'],
    root = document,
    includeInherited = true,
    colorSpace = 'rgb'
  } = options;
  
  if (!color) {
    throw new Error('Color option is required');
  }
  
  const targetColor = normalizeColor(color);
  if (!targetColor) {
    throw new Error('Invalid color format');
  }
  
  const results = [];
  const elements = root.getElementsByTagName('*');
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const match = checkElementColorMatch(element, targetColor, {
      tolerance,
      properties,
      includeInherited,
      colorSpace
    });
    
    if (match.found) {
      results.push({
        element,
        matchedProperties: match.properties,
        distances: match.distances
      });
    }
  }
  
  return results;
}

/**
 * Check if element matches color criteria
 */
function checkElementColorMatch(element, targetColor, options) {
  const { tolerance, properties, includeInherited, colorSpace } = options;
  const computedStyle = getComputedStyle(element);
  const matchedProperties = [];
  const distances = {};
  
  for (const property of properties) {
    const elementColor = computedStyle.getPropertyValue(property);
    const parsedColor = parseRgbColor(elementColor);
    
    if (parsedColor) {
      const distance = calculateColorDistance(parsedColor, targetColor, colorSpace);
      distances[property] = distance;
      
      if (distance <= tolerance) {
        matchedProperties.push(property);
      }
    }
  }
  
  return {
    found: matchedProperties.length > 0,
    properties: matchedProperties,
    distances
  };
}

/**
 * Calculate distance between colors in specified color space
 */
function calculateColorDistance(color1, color2, colorSpace = 'rgb') {
  switch (colorSpace) {
    case 'rgb':
      return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
      );
    
    case 'lab':
      // Convert to LAB color space for perceptually uniform comparison
      const lab1 = rgbToLab(color1);
      const lab2 = rgbToLab(color2);
      return Math.sqrt(
        Math.pow(lab1.l - lab2.l, 2) +
        Math.pow(lab1.a - lab2.a, 2) +
        Math.pow(lab1.b - lab2.b, 2)
      );
    
    default:
      return calculateColorDistance(color1, color2, 'rgb');
  }
}

/**
 * Convert RGB to LAB color space (simplified)
 */
function rgbToLab(rgb) {
  // Simplified RGB to LAB conversion
  // In production, use a proper color science library
  const { r, g, b } = rgb;
  
  // Convert to XYZ first (simplified)
  let x = (r / 255) * 95.047;
  let y = (g / 255) * 100.000;
  let z = (b / 255) * 108.883;
  
  // Convert XYZ to LAB (simplified)
  const fx = x > 0.008856 ? Math.pow(x / 95.047, 1/3) : (7.787 * x / 95.047) + (16/116);
  const fy = y > 0.008856 ? Math.pow(y / 100.000, 1/3) : (7.787 * y / 100.000) + (16/116);
  const fz = z > 0.008856 ? Math.pow(z / 108.883, 1/3) : (7.787 * z / 108.883) + (16/116);
  
  return {
    l: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

// =======================
// Approach 3: Color Range and Palette Matching
// =======================

/**
 * Find elements with colors within a specific range or palette
 */
function findElementsByColorRange(options = {}) {
  const {
    colorRange,
    palette,
    properties = ['color', 'background-color'],
    root = document,
    tolerance = 10
  } = options;
  
  if (!colorRange && !palette) {
    throw new Error('Either colorRange or palette must be specified');
  }
  
  const results = [];
  const elements = root.getElementsByTagName('*');
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const computedStyle = getComputedStyle(element);
    
    for (const property of properties) {
      const elementColor = computedStyle.getPropertyValue(property);
      const parsedColor = parseRgbColor(elementColor);
      
      if (parsedColor && isColorInRange(parsedColor, { colorRange, palette, tolerance })) {
        results.push({
          element,
          property,
          color: elementColor,
          parsedColor
        });
        break; // Don't add same element multiple times
      }
    }
  }
  
  return results;
}

/**
 * Check if color is within specified range or palette
 */
function isColorInRange(color, { colorRange, palette, tolerance }) {
  if (palette) {
    // Check if color matches any color in palette
    return palette.some(paletteColor => {
      const normalizedPalette = normalizeColor(paletteColor);
      return normalizedPalette && 
             calculateColorDistance(color, normalizedPalette) <= tolerance;
    });
  }
  
  if (colorRange) {
    // Check if color is within HSL range
    const hsl = rgbToHsl(color);
    const { hue, saturation, lightness } = colorRange;
    
    return (hue ? isInRange(hsl.h, hue) : true) &&
           (saturation ? isInRange(hsl.s, saturation) : true) &&
           (lightness ? isInRange(hsl.l, lightness) : true);
  }
  
  return false;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb) {
  const { r, g, b } = rgb;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / diff + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / diff + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Check if value is within range
 */
function isInRange(value, range) {
  if (Array.isArray(range)) {
    return value >= range[0] && value <= range[1];
  }
  return value === range;
}

// =======================
// Utility Functions
// =======================

/**
 * Get all unique colors used in document
 */
function getAllColorsInDocument(properties = ['color', 'background-color']) {
  const colors = new Set();
  const elements = document.getElementsByTagName('*');
  
  for (let i = 0; i < elements.length; i++) {
    const computedStyle = getComputedStyle(elements[i]);
    
    for (const property of properties) {
      const color = computedStyle.getPropertyValue(property);
      if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
        colors.add(color);
      }
    }
  }
  
  return Array.from(colors);
}

/**
 * Analyze color usage in document
 */
function analyzeColorUsage(root = document) {
  const colorStats = new Map();
  const elements = root.getElementsByTagName('*');
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const computedStyle = getComputedStyle(element);
    
    ['color', 'background-color', 'border-color'].forEach(property => {
      const color = computedStyle.getPropertyValue(property);
      
      if (color && color !== 'transparent') {
        const key = `${property}:${color}`;
        colorStats.set(key, (colorStats.get(key) || 0) + 1);
      }
    });
  }
  
  return Array.from(colorStats.entries())
    .map(([key, count]) => {
      const [property, color] = key.split(':');
      return { property, color, count, percentage: (count / elements.length * 100).toFixed(2) };
    })
    .sort((a, b) => b.count - a.count);
}

// Export for use in other modules
module.exports = {
  findElementsByColorProperty,
  findElementsByColorAdvanced,
  findElementsByColorRange,
  normalizeColor,
  parseRgbColor,
  colorsMatch,
  calculateColorDistance,
  rgbToHsl,
  rgbToLab,
  getAllColorsInDocument,
  analyzeColorUsage
};