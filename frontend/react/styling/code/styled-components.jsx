/**
 * File: styled-components.jsx
 * Description: Comprehensive styled-components patterns and best practices
 * 
 * Learning objectives:
 * - Master styled-components syntax and component creation
 * - Understand prop-based styling and theme integration
 * - Learn performance optimization techniques
 * - Explore advanced patterns and composition
 * 
 * Bundle Size: styled-components (~40KB gzipped)
 * Performance: Runtime styling with caching optimizations
 */

import React, { useState, useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes, css } from 'styled-components';

// ==================== THEME SETUP ====================
// Define design tokens in a structured theme object
// This approach centralizes all design decisions and enables consistent styling
const lightTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.8'
    }
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  }
};

// Dark theme variant - notice how we only override different values
// This pattern ensures consistency while supporting theme variations
const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    border: '#333333'
  }
};

// ==================== GLOBAL STYLES ====================
// Global styles handle CSS reset and base styles
// Use createGlobalStyle for app-wide styling that can access theme
const GlobalStyle = createGlobalStyle`
  /* CSS reset and base styles with theme integration */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize.md};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
    
    /* Smooth transitions for theme changes */
    transition: color 0.2s ease, background-color 0.2s ease;
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

// ==================== ANIMATIONS ====================
// Define reusable keyframe animations
// Keyframes are scoped to styled-components and can be shared
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ==================== BASIC STYLED COMPONENTS ====================

// Basic styled component with theme integration
// The 'styled' function creates a React component with attached styles
const Button = styled.button`
  /* Base styles using theme values */
  font-family: ${props => props.theme.typography.fontFamily};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  /* Spacing from theme ensures consistency */
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid transparent;
  
  /* Cursor and transitions for better UX */
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Default appearance */
  background-color: ${props => props.theme.colors.primary};
  color: white;
  
  /* Hover and focus states for interactivity */
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Prop-based variants - this pattern allows flexible styling */
  ${props => props.variant === 'secondary' && css`
    background-color: transparent;
    color: ${props.theme.colors.primary};
    border-color: ${props.theme.colors.primary};
    
    &:hover {
      background-color: ${props.theme.colors.primary};
      color: white;
    }
  `}

  ${props => props.variant === 'danger' && css`
    background-color: ${props.theme.colors.danger};
    
    &:hover {
      background-color: #c82333; /* Darker shade for hover */
    }
  `}

  /* Size variants using props */
  ${props => props.size === 'small' && css`
    padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
    font-size: ${props.theme.typography.fontSize.sm};
  `}

  ${props => props.size === 'large' && css`
    padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
    font-size: ${props.theme.typography.fontSize.lg};
  `}

  /* Full width variant */
  ${props => props.fullWidth && css`
    width: 100%;
  `}

  /* Loading state with animation */
  ${props => props.loading && css`
    animation: ${pulse} 1.5s ease-in-out infinite;
    pointer-events: none;
  `}
`;

// ==================== COMPONENT COMPOSITION ====================

// Container component for layout and spacing
// This pattern creates reusable layout primitives
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  
  /* Responsive padding adjustments */
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }
`;

// Card component with elevation and spacing
const Card = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  
  /* Animation on mount */
  animation: ${fadeIn} 0.3s ease-out;
  
  /* Hover effect for interactive cards */
  ${props => props.interactive && css`
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.md};
    }
  `}
`;

// Typography components with consistent styling
const Heading = styled.h1`
  font-size: ${props => {
    const sizes = {
      1: props.theme.typography.fontSize.xxl,
      2: props.theme.typography.fontSize.xl,
      3: props.theme.typography.fontSize.lg,
      4: props.theme.typography.fontSize.md
    };
    return sizes[props.level] || sizes[1];
  }};
  
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const Text = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.muted ? props.theme.colors.textSecondary : props.theme.colors.text};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  /* Text variant styles */
  ${props => props.variant === 'small' && css`
    font-size: ${props.theme.typography.fontSize.sm};
  `}

  ${props => props.variant === 'large' && css`
    font-size: ${props.theme.typography.fontSize.lg};
  `}
`;

// ==================== ADVANCED PATTERNS ====================

// Higher-order styled component - extends existing component
const IconButton = styled(Button)`
  /* Inherit all Button styles and add icon-specific styling */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  
  /* Square aspect ratio for icon-only buttons */
  ${props => props.iconOnly && css`
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: ${props.theme.borderRadius.full};
  `}
`;

// Grid system using CSS Grid
const Grid = styled.div`
  display: grid;
  gap: ${props => props.gap || props.theme.spacing.md};
  
  /* Responsive column system */
  grid-template-columns: repeat(${props => props.cols || 1}, 1fr);
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(${props => props.mdCols || props.cols || 1}, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(${props => props.lgCols || props.mdCols || props.cols || 1}, 1fr);
  }
`;

// Form components with consistent styling
const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-family: ${props => props.theme.typography.fontFamily};
  
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}25;
    outline: none;
  }
  
  /* Error state styling */
  ${props => props.error && css`
    border-color: ${props.theme.colors.danger};
    
    &:focus {
      border-color: ${props.theme.colors.danger};
      box-shadow: 0 0 0 3px ${props.theme.colors.danger}25;
    }
  `}
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// ==================== PERFORMANCE OPTIMIZATION ====================

// Memoized styled component to prevent unnecessary re-renders
// Use this pattern for complex styled components that receive many props
const OptimizedCard = React.memo(styled.div`
  /* Expensive styles that shouldn't recalculate on every render */
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}10 0%,
    ${props => props.theme.colors.secondary}10 100%
  );
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  
  /* Complex animations that benefit from memoization */
  transform: ${props => props.elevated ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)'};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`);

// ==================== EXAMPLE COMPONENT ====================

const StyledComponentsExample = () => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  
  // Memoize theme object to prevent unnecessary re-renders
  // This is crucial for performance when theme switching
  const currentTheme = useMemo(() => {
    return theme === 'light' ? lightTheme : darkTheme;
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    // Simulate async operation
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Container>
        <Card>
          <Heading level={1}>Styled Components Demo</Heading>
          <Text>
            This example demonstrates comprehensive styled-components patterns 
            including theming, prop-based styling, and performance optimizations.
          </Text>
          
          <Grid cols={1} mdCols={2} gap="24px">
            <div>
              <Heading level={3}>Button Variations</Heading>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button size="small">Small</Button>
                <Button size="large">Large</Button>
              </div>
              
              <Button 
                fullWidth 
                loading={loading}
                onClick={handleLoadingDemo}
              >
                {loading ? 'Loading...' : 'Test Loading State'}
              </Button>
            </div>
            
            <div>
              <Heading level={3}>Form Elements</Heading>
              <FormGroup>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input 
                  type="password" 
                  id="password" 
                  placeholder="Enter password"
                  error={false} // Set to true to see error styling
                />
              </FormGroup>
            </div>
          </Grid>
          
          <OptimizedCard elevated={true}>
            <Text>
              This card uses React.memo optimization to prevent unnecessary re-renders
              when parent components update.
            </Text>
          </OptimizedCard>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <IconButton onClick={handleThemeToggle}>
              {theme === 'light' ? '🌙' : '☀️'}
              Toggle Theme
            </IconButton>
          </div>
          
          <Text variant="small" muted>
            Current theme: {theme} | 
            Components are styled with theme-aware properties for consistency.
          </Text>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

// ==================== BEST PRACTICES SUMMARY ====================
/*
1. THEME ORGANIZATION:
   - Structure themes with logical groupings (colors, spacing, typography)
   - Use consistent naming conventions across theme objects
   - Support theme variants while maintaining structure consistency

2. COMPONENT PATTERNS:
   - Use props for component variants instead of creating multiple components
   - Implement consistent hover/focus states for interactive elements
   - Group related styles using css template literal for better organization

3. PERFORMANCE OPTIMIZATION:
   - Memoize theme objects when theme switching is supported
   - Use React.memo for expensive styled components
   - Avoid inline styles and prefer prop-based styling

4. MAINTAINABILITY:
   - Use semantic naming for styled components (Button, Card, not StyledDiv)
   - Keep styled components close to where they're used
   - Document complex styling logic with comments

5. ACCESSIBILITY:
   - Include focus styles for all interactive elements
   - Use semantic HTML elements as the base for styled components
   - Ensure color contrast meets accessibility standards
*/

export default StyledComponentsExample;
export { 
  Button, 
  Card, 
  Container, 
  Heading, 
  Text, 
  Grid, 
  FormGroup, 
  Label, 
  Input,
  lightTheme,
  darkTheme
};