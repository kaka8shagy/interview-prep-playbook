/**
 * File: hex-rgb-converter.js
 * Description: Bidirectional HEX ↔ RGB color conversion with multiple approaches
 * 
 * Learning objectives:
 * - Understand color representation systems
 * - Learn bitwise operations for color manipulation
 * - See input validation and error handling patterns
 * 
 * Time Complexity: O(1) for all conversions
 * Space Complexity: O(1)
 */

// =======================
// Approach 1: Basic HEX to RGB Conversion
// =======================

/**
 * Convert HEX color to RGB values
 * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) formats
 * 
 * Mental model: HEX is base-16 representation of RGB components
 * Each pair of hex digits represents one color component (0-255)
 */
function hexToRgb(hex) {
  // Input validation and normalization
  if (typeof hex !== 'string') {
    throw new Error('HEX value must be a string');
  }
  
  // Remove # prefix if present
  hex = hex.replace('#', '');
  
  // Validate hex format
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error('Invalid HEX format. Expected #RGB or #RRGGBB');
  }
  
  // Handle short format (#RGB -> #RRGGBB)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Extract RGB components using substring and parseInt
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

// =======================
// Approach 2: RGB to HEX Conversion
// =======================

/**
 * Convert RGB values to HEX color string
 * Handles input validation and ensures proper formatting
 * 
 * Mental model: Convert decimal (0-255) to hexadecimal (00-FF)
 * Pad with leading zeros if needed
 */
function rgbToHex(r, g, b, includeHash = true) {
  // Input validation
  const validateComponent = (component, name) => {
    if (typeof component !== 'number' || !Number.isInteger(component)) {
      throw new Error(`${name} must be an integer`);
    }
    if (component < 0 || component > 255) {
      throw new Error(`${name} must be between 0 and 255, got ${component}`);
    }
  };
  
  validateComponent(r, 'Red');
  validateComponent(g, 'Green');
  validateComponent(b, 'Blue');
  
  // Convert each component to hex and pad with leading zero if needed
  const toHex = (component) => {
    const hex = component.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  const hexValue = toHex(r) + toHex(g) + toHex(b);
  
  return includeHash ? '#' + hexValue : hexValue;
}

// =======================
// Approach 3: Bitwise Operations for Performance
// =======================

/**
 * High-performance HEX to RGB using bitwise operations
 * More efficient for frequent conversions
 * 
 * Mental model: Treat hex as single integer, extract bytes with bit shifting
 */
function hexToRgbBitwise(hex) {
  // Normalize input
  hex = hex.replace('#', '');
  
  // Handle short format
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Convert to integer
  const hexInt = parseInt(hex, 16);
  
  if (isNaN(hexInt)) {
    throw new Error('Invalid HEX format');
  }
  
  // Extract RGB using bitwise operations
  // Right shift and mask to extract specific bytes
  const r = (hexInt >> 16) & 0xFF;  // Extract high byte (red)
  const g = (hexInt >> 8) & 0xFF;   // Extract middle byte (green)  
  const b = hexInt & 0xFF;          // Extract low byte (blue)
  
  return { r, g, b };
}

/**
 * High-performance RGB to HEX using bitwise operations
 * Combines components into single integer then converts to hex
 * 
 * Mental model: Combine RGB bytes into single 24-bit integer
 */
function rgbToHexBitwise(r, g, b, includeHash = true) {
  // Input validation (reuse from previous function)
  [r, g, b].forEach((component, index) => {
    const names = ['Red', 'Green', 'Blue'];
    if (typeof component !== 'number' || component < 0 || component > 255 || !Number.isInteger(component)) {
      throw new Error(`${names[index]} must be an integer between 0-255`);
    }
  });
  
  // Combine RGB into single integer using bit shifting
  // Shift red 16 bits left, green 8 bits left, blue stays in place
  const hexInt = (r << 16) | (g << 8) | b;
  
  // Convert to hex string and pad to 6 digits
  const hexValue = hexInt.toString(16).padStart(6, '0');
  
  return includeHash ? '#' + hexValue : hexValue;
}

// =======================
// Approach 4: Advanced Color Utilities
// =======================

/**
 * Comprehensive color converter with multiple input/output formats
 * Supports various color notations and provides additional utilities
 */
class ColorConverter {
  constructor() {
    this.formats = {
      HEX: 'hex',
      RGB: 'rgb',
      HSL: 'hsl',
      RGB_ARRAY: 'rgb_array',
      RGB_OBJECT: 'rgb_object'
    };
  }
  
  /**
   * Parse various color input formats
   */
  parseColor(input) {
    if (typeof input === 'string') {
      input = input.trim();
      
      // HEX format: #RRGGBB or #RGB
      if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(input)) {
        return { format: this.formats.HEX, value: input };
      }
      
      // RGB format: rgb(r, g, b) or rgba(r, g, b, a)
      const rgbMatch = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
      if (rgbMatch) {
        return {
          format: this.formats.RGB,
          value: {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3]),
            a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
          }
        };
      }
    }
    
    // RGB array format: [r, g, b]
    if (Array.isArray(input) && input.length >= 3) {
      return {
        format: this.formats.RGB_ARRAY,
        value: { r: input[0], g: input[1], b: input[2] }
      };
    }
    
    // RGB object format: {r, g, b}
    if (input && typeof input === 'object' && 'r' in input && 'g' in input && 'b' in input) {
      return {
        format: this.formats.RGB_OBJECT,
        value: input
      };
    }
    
    throw new Error('Unsupported color format');
  }
  
  /**
   * Convert to HEX from any supported format
   */
  toHex(input, includeHash = true) {
    const parsed = this.parseColor(input);
    
    switch (parsed.format) {
      case this.formats.HEX:
        return includeHash ? parsed.value : parsed.value.replace('#', '');
        
      case this.formats.RGB:
      case this.formats.RGB_ARRAY:
      case this.formats.RGB_OBJECT:
        return rgbToHex(parsed.value.r, parsed.value.g, parsed.value.b, includeHash);
        
      default:
        throw new Error('Cannot convert to HEX');
    }
  }
  
  /**
   * Convert to RGB from any supported format
   */
  toRgb(input, format = 'object') {
    const parsed = this.parseColor(input);
    let rgb;
    
    switch (parsed.format) {
      case this.formats.HEX:
        rgb = hexToRgb(parsed.value);
        break;
        
      case this.formats.RGB:
      case this.formats.RGB_ARRAY:
      case this.formats.RGB_OBJECT:
        rgb = parsed.value;
        break;
        
      default:
        throw new Error('Cannot convert to RGB');
    }
    
    // Return in requested format
    switch (format) {
      case 'object':
        return rgb;
      case 'array':
        return [rgb.r, rgb.g, rgb.b];
      case 'string':
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      default:
        return rgb;
    }
  }
  
  /**
   * Get color information and analysis
   */
  analyzeColor(input) {
    const rgb = this.toRgb(input);
    const hex = this.toHex(input);
    
    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Calculate color temperature (rough approximation)
    const colorTemp = this.estimateColorTemperature(rgb);
    
    return {
      rgb,
      hex,
      luminance: Math.round(luminance * 100) / 100,
      brightness: luminance > 0.5 ? 'light' : 'dark',
      colorTemperature: colorTemp,
      contrast: {
        white: this.calculateContrast(rgb, { r: 255, g: 255, b: 255 }),
        black: this.calculateContrast(rgb, { r: 0, g: 0, b: 0 })
      }
    };
  }
  
  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrast(color1, color2) {
    const lum1 = this.calculateLuminance(color1);
    const lum2 = this.calculateLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
  }
  
  /**
   * Calculate relative luminance
   */
  calculateLuminance(rgb) {
    const normalize = (component) => {
      const c = component / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * normalize(rgb.r) + 0.7152 * normalize(rgb.g) + 0.0722 * normalize(rgb.b);
  }
  
  /**
   * Estimate color temperature (simplified)
   */
  estimateColorTemperature(rgb) {
    const { r, g, b } = rgb;
    
    if (r > g && r > b) return 'warm';
    if (b > r && b > g) return 'cool';
    return 'neutral';
  }
}

// =======================
// Approach 5: Batch Processing and Utilities
// =======================

/**
 * Process multiple colors at once
 * Useful for theme processing or bulk operations
 */
function batchConvertHexToRgb(hexColors) {
  if (!Array.isArray(hexColors)) {
    throw new Error('Input must be an array of HEX colors');
  }
  
  return hexColors.map((hex, index) => {
    try {
      return {
        index,
        hex,
        rgb: hexToRgb(hex),
        success: true
      };
    } catch (error) {
      return {
        index,
        hex,
        error: error.message,
        success: false
      };
    }
  });
}

/**
 * Generate color palette variations
 * Creates lighter and darker variants of a base color
 */
function generatePalette(baseHex, steps = 5) {
  const baseRgb = hexToRgb(baseHex);
  const palette = [];
  
  for (let i = 0; i < steps; i++) {
    const factor = (i / (steps - 1)) * 2 - 1; // Range from -1 to 1
    
    let r, g, b;
    
    if (factor < 0) {
      // Darker variants
      const darkness = Math.abs(factor);
      r = Math.round(baseRgb.r * (1 - darkness));
      g = Math.round(baseRgb.g * (1 - darkness));
      b = Math.round(baseRgb.b * (1 - darkness));
    } else {
      // Lighter variants
      r = Math.round(baseRgb.r + (255 - baseRgb.r) * factor);
      g = Math.round(baseRgb.g + (255 - baseRgb.g) * factor);
      b = Math.round(baseRgb.b + (255 - baseRgb.b) * factor);
    }
    
    palette.push({
      step: i,
      factor,
      variant: factor < 0 ? 'darker' : factor > 0 ? 'lighter' : 'base',
      rgb: { r, g, b },
      hex: rgbToHex(r, g, b)
    });
  }
  
  return palette;
}

// =======================
// Validation and Utilities
// =======================

/**
 * Validate color accessibility compliance
 */
function checkAccessibility(foregroundHex, backgroundHex) {
  const converter = new ColorConverter();
  const fgRgb = converter.toRgb(foregroundHex);
  const bgRgb = converter.toRgb(backgroundHex);
  
  const contrast = converter.calculateContrast(fgRgb, bgRgb);
  
  return {
    contrast,
    wcag: {
      aa: {
        normal: contrast >= 4.5,
        large: contrast >= 3.0
      },
      aaa: {
        normal: contrast >= 7.0,
        large: contrast >= 4.5
      }
    },
    recommendation: contrast >= 7.0 ? 'Excellent' : 
                   contrast >= 4.5 ? 'Good' : 
                   contrast >= 3.0 ? 'Acceptable for large text' : 'Poor'
  };
}

/**
 * Random color generator
 */
function generateRandomColor(format = 'hex') {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  
  switch (format) {
    case 'hex':
      return rgbToHex(r, g, b);
    case 'rgb':
      return { r, g, b };
    case 'array':
      return [r, g, b];
    default:
      return rgbToHex(r, g, b);
  }
}

// =======================
// Real-world Examples
// =======================

// Example: Process CSS color variables
const cssColors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  background: '#f8f9fa',
  text: '#2c3e50'
};

// Example: Brand color system
const brandColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7'  // Yellow
];

// =======================
// Testing and Demonstration
// =======================

function demonstrateColorConversion() {
  console.log('\n=== Basic HEX to RGB Demo ===');
  console.log('HEX #FF0000 to RGB:', hexToRgb('#FF0000'));
  console.log('HEX #RGB to RGB:', hexToRgb('#F0A'));
  
  console.log('\n=== RGB to HEX Demo ===');
  console.log('RGB (255, 0, 0) to HEX:', rgbToHex(255, 0, 0));
  console.log('RGB (15, 240, 160) to HEX:', rgbToHex(15, 240, 160));
  
  console.log('\n=== Bitwise Operations Demo ===');
  console.log('Bitwise HEX to RGB:', hexToRgbBitwise('#3498db'));
  console.log('Bitwise RGB to HEX:', rgbToHexBitwise(52, 152, 219));
  
  console.log('\n=== Advanced Converter Demo ===');
  const converter = new ColorConverter();
  console.log('Color analysis:', converter.analyzeColor('#3498db'));
  
  console.log('\n=== Batch Processing Demo ===');
  const batchResult = batchConvertHexToRgb(brandColors);
  console.log('Batch conversion results:', batchResult);
  
  console.log('\n=== Palette Generation Demo ===');
  const palette = generatePalette('#3498db', 5);
  console.log('Color palette:', palette.map(p => ({ variant: p.variant, hex: p.hex })));
  
  console.log('\n=== Accessibility Check Demo ===');
  const accessibility = checkAccessibility('#000000', '#FFFFFF');
  console.log('Black on white accessibility:', accessibility);
  
  console.log('\n=== Random Color Demo ===');
  console.log('Random HEX:', generateRandomColor('hex'));
  console.log('Random RGB:', generateRandomColor('rgb'));
}

// Uncomment to run demonstrations
// demonstrateColorConversion();

// Export for use in other modules
module.exports = {
  // Basic conversions
  hexToRgb,
  rgbToHex,
  
  // Bitwise optimized versions
  hexToRgbBitwise,
  rgbToHexBitwise,
  
  // Advanced utilities
  ColorConverter,
  batchConvertHexToRgb,
  generatePalette,
  checkAccessibility,
  generateRandomColor
};