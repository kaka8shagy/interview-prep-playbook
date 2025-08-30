/**
 * File: emotion-setup.jsx
 * Description: Emotion CSS-in-JS library patterns and performance optimization
 * 
 * Learning objectives:
 * - Master Emotion's flexible API (css prop, styled, and css function)
 * - Understand performance optimizations with Emotion
 * - Learn compile-time vs runtime trade-offs
 * - Explore advanced composition and theming patterns
 * 
 * Bundle Size: @emotion/react (~18KB) + @emotion/styled (~8KB)
 * Performance: Optimized runtime with better caching than styled-components
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  css, 
  jsx, 
  ThemeProvider, 
  keyframes, 
  Global 
} from '@emotion/react';
import styled from '@emotion/styled';
import { cache } from '@emotion/css';

// ==================== THEME CONFIGURATION ====================
// Emotion theme structure - similar to styled-components but optimized for performance
const emotionTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      500: '#6b7280',
      600: '#4b5563',
      900: '#111827'
    },
    red: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    }
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 64],
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  },
  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  breakpoints: ['576px', '768px', '992px', '1200px']
};

// ==================== GLOBAL STYLES WITH EMOTION ====================
// Global styles using Emotion's Global component
const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                 Oxygen, Ubuntu, Cantarell, sans-serif;
    color: ${emotionTheme.colors.gray[900]};
    background-color: ${emotionTheme.colors.gray[50]};
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid ${emotionTheme.colors.primary[500]};
    outline-offset: 2px;
  }

  /* Remove focus outline for mouse users but keep for keyboard users */
  .js-focus-visible *:focus:not(.focus-visible) {
    outline: none;
  }
`;

// ==================== EMOTION KEYFRAMES ====================
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// ==================== CSS PROP PATTERNS ====================
// The css prop is Emotion's most flexible API
// It allows inline styles with full CSS-in-JS capabilities

const CSSPropExample = ({ theme }) => {
  // CSS prop with template literals - most readable for complex styles
  const cardStyles = css`
    background-color: white;
    padding: ${theme.space[6]}px;
    border-radius: ${theme.radii.lg}px;
    box-shadow: ${theme.shadows.md};
    margin-bottom: ${theme.space[4]}px;
    animation: ${fadeInUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    /* Responsive styles using theme breakpoints */
    @media (min-width: ${theme.breakpoints[1]}) {
      padding: ${theme.space[8]}px;
      margin-bottom: ${theme.space[6]}px;
    }

    /* Hover states */
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
      transition: all 0.2s ease;
    }

    /* Nested selectors */
    h2 {
      color: ${theme.colors.gray[900]};
      font-size: ${theme.fontSizes[5]}px;
      font-weight: ${theme.fontWeights.bold};
      margin-bottom: ${theme.space[3]}px;
    }

    p {
      color: ${theme.colors.gray[600]};
      line-height: ${theme.lineHeights.relaxed};
    }
  `;

  // CSS prop with object syntax - better for simple styles or dynamic values
  const buttonStyles = css({
    backgroundColor: theme.colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: theme.radii.md,
    padding: `${theme.space[3]}px ${theme.space[6]}px`,
    fontSize: theme.fontSizes[2],
    fontWeight: theme.fontWeights.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: theme.colors.primary[600],
      transform: 'translateY(-1px)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
    },

    // Responsive styles in object syntax
    [`@media (min-width: ${theme.breakpoints[0]})`]: {
      padding: `${theme.space[4]}px ${theme.space[8]}px`,
      fontSize: theme.fontSizes[3],
    }
  });

  return (
    <div css={cardStyles}>
      <h2>CSS Prop Example</h2>
      <p>
        The css prop provides the most flexible way to style components with Emotion.
        You can use template literals for complex CSS or object syntax for simpler styles.
      </p>
      <button css={buttonStyles}>
        Interactive Button
      </button>
    </div>
  );
};

// ==================== STYLED COMPONENTS WITH EMOTION ====================
// Emotion's styled API is similar to styled-components but with better performance

// Basic styled component with theme integration
const StyledButton = styled.button(
  {
    // Base styles using object syntax for better performance
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    }
  },
  // Function to access theme and props - called only when props change
  ({ theme, variant = 'primary', size = 'medium' }) => {
    // Size configurations
    const sizeConfig = {
      small: {
        padding: `${theme.space[2]}px ${theme.space[4]}px`,
        fontSize: theme.fontSizes[1],
        fontWeight: theme.fontWeights.medium,
      },
      medium: {
        padding: `${theme.space[3]}px ${theme.space[6]}px`,
        fontSize: theme.fontSizes[2],
        fontWeight: theme.fontWeights.medium,
      },
      large: {
        padding: `${theme.space[4]}px ${theme.space[8]}px`,
        fontSize: theme.fontSizes[3],
        fontWeight: theme.fontWeights.semibold,
      }
    };

    // Variant configurations
    const variantConfig = {
      primary: {
        backgroundColor: theme.colors.primary[500],
        color: 'white',
        borderRadius: theme.radii.md,
        '&:hover': {
          backgroundColor: theme.colors.primary[600],
        }
      },
      secondary: {
        backgroundColor: 'transparent',
        color: theme.colors.primary[600],
        border: `2px solid ${theme.colors.primary[500]}`,
        borderRadius: theme.radii.md,
        '&:hover': {
          backgroundColor: theme.colors.primary[50],
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.colors.gray[600],
        border: 'none',
        '&:hover': {
          backgroundColor: theme.colors.gray[100],
          color: theme.colors.gray[900],
        }
      }
    };

    return {
      ...sizeConfig[size],
      ...variantConfig[variant],
    };
  }
);

// Advanced styled component with complex logic
const Card = styled.div(
  // Base styles
  {
    backgroundColor: 'white',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Dynamic styles based on props and theme
  ({ theme, elevated, interactive, padding = 'medium' }) => {
    const paddingConfig = {
      none: 0,
      small: theme.space[4],
      medium: theme.space[6],
      large: theme.space[8],
    };

    const baseStyles = {
      borderRadius: theme.radii.lg,
      padding: paddingConfig[padding],
      boxShadow: elevated ? theme.shadows.lg : theme.shadows.sm,
    };

    // Interactive card styles
    if (interactive) {
      baseStyles.cursor = 'pointer';
      baseStyles['&:hover'] = {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows.xl,
      };
      baseStyles['&:active'] = {
        transform: 'translateY(-2px)',
      };
    }

    return baseStyles;
  }
);

// ==================== PERFORMANCE OPTIMIZATIONS ====================

// Memoized styles using useMemo for expensive calculations
const useOptimizedStyles = (theme, props) => {
  // This hook memoizes expensive style calculations
  // Only recalculates when dependencies change
  return useMemo(() => {
    const { isActive, complexity, data } = props;
    
    // Simulate expensive style calculation
    const complexGradient = data?.map((item, index) => (
      `${theme.colors.primary[500]}${Math.floor(50 + index * 10)} ${index * 10}%`
    )).join(', ');

    return css`
      background: ${complexity > 5 ? 
        `linear-gradient(135deg, ${complexGradient})` : 
        theme.colors.gray[100]
      };
      
      transform: ${isActive ? 'scale(1.02)' : 'scale(1)'};
      transition: transform 0.2s ease;
      
      /* Only apply expensive filters when active */
      ${isActive && css`
        filter: brightness(1.1) saturate(1.2);
      `}
    `;
  }, [theme, props.isActive, props.complexity, props.data]);
};

// Component using optimized styles
const OptimizedComponent = (props) => {
  const styles = useOptimizedStyles(emotionTheme, props);
  
  return (
    <div css={styles}>
      <h3>Optimized Component</h3>
      <p>This component uses memoized styles for better performance.</p>
    </div>
  );
};

// ==================== COMPOSITION PATTERNS ====================

// Utility function for style composition
const compose = (...styles) => css(styles);

// Base styles that can be composed
const baseInputStyles = css`
  border: 2px solid ${emotionTheme.colors.gray[200]};
  border-radius: ${emotionTheme.radii.md}px;
  padding: ${emotionTheme.space[3]}px ${emotionTheme.space[4]}px;
  font-size: ${emotionTheme.fontSizes[2]}px;
  transition: all 0.2s ease;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${emotionTheme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${emotionTheme.colors.primary[500]}20;
  }
`;

const errorInputStyles = css`
  border-color: ${emotionTheme.colors.red[500]};
  
  &:focus {
    border-color: ${emotionTheme.colors.red[500]};
    box-shadow: 0 0 0 3px ${emotionTheme.colors.red[500]}20;
  }
`;

const successInputStyles = css`
  border-color: ${emotionTheme.colors.primary[500]};
  background-color: ${emotionTheme.colors.primary[50]};
`;

// Composed input component
const Input = ({ error, success, ...props }) => (
  <input
    css={compose(
      baseInputStyles,
      error && errorInputStyles,
      success && successInputStyles
    )}
    {...props}
  />
);

// ==================== EXAMPLE COMPONENT ====================

const EmotionExample = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [errors, setErrors] = useState({});

  // Performance: memoize callback to prevent unnecessary re-renders
  const handleCardClick = useCallback((cardId) => {
    setActiveCard(prev => prev === cardId ? null : cardId);
  }, []);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.name) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <ThemeProvider theme={emotionTheme}>
      <Global styles={globalStyles} />
      
      <div css={css`
        max-width: 800px;
        margin: 0 auto;
        padding: ${emotionTheme.space[6]}px;
      `}>
        <h1 css={css`
          font-size: ${emotionTheme.fontSizes[7]}px;
          font-weight: ${emotionTheme.fontWeights.bold};
          color: ${emotionTheme.colors.gray[900]};
          margin-bottom: ${emotionTheme.space[8]}px;
          text-align: center;
        `}>
          Emotion CSS-in-JS Demo
        </h1>

        {/* CSS Prop Example */}
        <CSSPropExample theme={emotionTheme} />

        {/* Styled Components Grid */}
        <div css={css`
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: ${emotionTheme.space[6]}px;
          margin-bottom: ${emotionTheme.space[8]}px;
        `}>
          {[1, 2, 3].map(id => (
            <Card
              key={id}
              interactive
              elevated={activeCard === id}
              onClick={() => handleCardClick(id)}
              css={css`
                animation: ${scaleIn} 0.3s ease-out ${id * 0.1}s both;
              `}
            >
              <h3 css={css`
                font-size: ${emotionTheme.fontSizes[4]}px;
                font-weight: ${emotionTheme.fontWeights.semibold};
                margin-bottom: ${emotionTheme.space[3]}px;
                color: ${activeCard === id ? 
                  emotionTheme.colors.primary[600] : 
                  emotionTheme.colors.gray[900]
                };
              `}>
                Interactive Card {id}
              </h3>
              <p css={css`
                color: ${emotionTheme.colors.gray[600]};
                margin-bottom: ${emotionTheme.space[4]}px;
              `}>
                Click this card to see the elevation effect. 
                {activeCard === id ? ' Currently active!' : ''}
              </p>
            </Card>
          ))}
        </div>

        {/* Button Variants */}
        <Card padding="large" css={css`margin-bottom: ${emotionTheme.space[8]}px;`}>
          <h2 css={css`
            font-size: ${emotionTheme.fontSizes[5]}px;
            margin-bottom: ${emotionTheme.space[4]}px;
          `}>Button Variants</h2>
          
          <div css={css`
            display: flex;
            gap: ${emotionTheme.space[3]}px;
            flex-wrap: wrap;
            margin-bottom: ${emotionTheme.space[6]}px;
          `}>
            <StyledButton variant="primary" size="small">Primary Small</StyledButton>
            <StyledButton variant="secondary" size="medium">Secondary Medium</StyledButton>
            <StyledButton variant="ghost" size="large">Ghost Large</StyledButton>
          </div>
        </Card>

        {/* Form Example with Composition */}
        <Card padding="large">
          <h2 css={css`
            font-size: ${emotionTheme.fontSizes[5]}px;
            margin-bottom: ${emotionTheme.space[4]}px;
          `}>Form with Style Composition</h2>
          
          <form css={css`
            display: grid;
            gap: ${emotionTheme.space[4]}px;
          `}>
            <div>
              <label css={css`
                display: block;
                margin-bottom: ${emotionTheme.space[2]}px;
                font-weight: ${emotionTheme.fontWeights.medium};
                color: ${emotionTheme.colors.gray[700]};
              `}>
                Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                placeholder="Enter your name"
              />
              {errors.name && (
                <div css={css`
                  color: ${emotionTheme.colors.red[500]};
                  font-size: ${emotionTheme.fontSizes[1]}px;
                  margin-top: ${emotionTheme.space[1]}px;
                `}>
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label css={css`
                display: block;
                margin-bottom: ${emotionTheme.space[2]}px;
                font-weight: ${emotionTheme.fontWeights.medium};
                color: ${emotionTheme.colors.gray[700]};
              `}>
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                success={formData.email && !errors.email}
                placeholder="Enter your email"
              />
              {errors.email && (
                <div css={css`
                  color: ${emotionTheme.colors.red[500]};
                  font-size: ${emotionTheme.fontSizes[1]}px;
                  margin-top: ${emotionTheme.space[1]}px;
                `}>
                  {errors.email}
                </div>
              )}
            </div>

            <StyledButton
              type="button"
              variant="primary"
              onClick={validateForm}
              css={css`
                justify-self: start;
                margin-top: ${emotionTheme.space[2]}px;
              `}
            >
              Validate Form
            </StyledButton>
          </form>
        </Card>

        {/* Performance Demo */}
        <div css={css`margin-top: ${emotionTheme.space[8]}px;`}>
          <OptimizedComponent
            isActive={activeCard === 2}
            complexity={7}
            data={[1, 2, 3, 4, 5]}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

// ==================== PERFORMANCE BEST PRACTICES ====================
/*
1. USE OBJECT SYNTAX FOR BETTER PERFORMANCE:
   - Object syntax is faster than template literals for simple styles
   - Template literals are better for complex CSS with nesting

2. MEMOIZE EXPENSIVE CALCULATIONS:
   - Use useMemo for complex style calculations
   - Memoize callback functions to prevent unnecessary re-renders

3. OPTIMIZE THEME USAGE:
   - Keep theme objects stable to prevent unnecessary re-renders
   - Use theme values consistently across components

4. COMPOSITION OVER INHERITANCE:
   - Compose styles using utility functions
   - Create reusable style primitives

5. RUNTIME VS COMPILE-TIME:
   - Consider @emotion/babel-plugin for compile-time optimizations
   - Use static extraction in production builds

6. AVOID ANTI-PATTERNS:
   - Don't create styled components inside render functions
   - Avoid inline css prop with complex calculations
   - Don't recreate theme objects unnecessarily
*/

export default EmotionExample;
export { 
  StyledButton, 
  Card, 
  Input, 
  emotionTheme,
  compose,
  baseInputStyles,
  errorInputStyles,
  successInputStyles 
};