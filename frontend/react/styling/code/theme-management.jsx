/**
 * File: theme-management.jsx
 * Description: Advanced theme management system with multiple themes, persistence, and dynamic switching
 * 
 * Learning objectives:
 * - Implement a scalable theme system with multiple variants
 * - Handle theme persistence and synchronization across tabs
 * - Create theme-aware components with consistent interfaces
 * - Optimize theme switching performance
 * 
 * Key Concepts:
 * - Theme Provider patterns and context optimization
 * - Theme token architecture and design system integration
 * - Runtime theme switching with smooth transitions
 * - Theme persistence with localStorage and system preferences
 */

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useMemo,
  useCallback,
  useState 
} from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

// ==================== DESIGN TOKENS ARCHITECTURE ====================
// Design tokens form the foundation of a scalable theme system
// They represent design decisions as data that can be consumed by any platform

const designTokens = {
  // Color semantics - semantic naming allows theme variations
  colors: {
    // Primitive colors - the base palette
    primitive: {
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      green: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
      },
      red: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
      },
      amber: {
        50: '#fffbeb',
        500: '#f59e0b',
        600: '#d97706',
      }
    },
    
    // Semantic colors - mapped to design intent
    semantic: {
      primary: 'blue',
      neutral: 'gray',
      success: 'green',
      danger: 'red',
      warning: 'amber'
    }
  },

  // Typography system with consistent scale
  typography: {
    fontFamilies: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Georgia', 'Times New Roman', 'serif'],
      mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace']
    },
    fontSizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tighter: '-0.025em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em',
      wider: '0.025em',
    }
  },

  // Spacing system using consistent scale
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },

  // Consistent border radius scale
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  // Shadow system for depth and elevation
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Breakpoint system for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation system for consistent motion
  animations: {
    durations: {
      fast: '150ms',
      normal: '250ms',
      slow: '500ms',
    },
    easings: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
};

// ==================== THEME BUILDER UTILITY ====================
// This utility creates theme objects from design tokens
// It resolves semantic color references and builds complete themes

const buildTheme = (variant, tokens = designTokens) => {
  // Helper function to resolve color references
  const resolveColor = (colorRef, shade = 500) => {
    if (typeof colorRef === 'string' && tokens.colors.primitive[colorRef]) {
      return tokens.colors.primitive[colorRef][shade];
    }
    return colorRef;
  };

  // Base theme structure that all variants share
  const baseTheme = {
    // Typography system
    fonts: {
      body: tokens.typography.fontFamilies.sans.join(', '),
      heading: tokens.typography.fontFamilies.sans.join(', '),
      mono: tokens.typography.fontFamilies.mono.join(', '),
    },
    fontSizes: tokens.typography.fontSizes,
    fontWeights: tokens.typography.fontWeights,
    lineHeights: tokens.typography.lineHeights,
    letterSpacings: tokens.typography.letterSpacing,

    // Layout system
    space: tokens.spacing,
    sizes: tokens.spacing,
    radii: tokens.borderRadius,
    shadows: tokens.shadows,
    breakpoints: Object.values(tokens.breakpoints),

    // Animation system
    transitions: {
      fast: `all ${tokens.animations.durations.fast} ${tokens.animations.easings.out}`,
      normal: `all ${tokens.animations.durations.normal} ${tokens.animations.easings.out}`,
      slow: `all ${tokens.animations.durations.slow} ${tokens.animations.easings.out}`,
    }
  };

  // Theme variant configurations
  const themeVariants = {
    light: {
      colors: {
        // Surface colors
        background: tokens.colors.primitive.gray[50],
        surface: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Text colors
        text: {
          primary: tokens.colors.primitive.gray[900],
          secondary: tokens.colors.primitive.gray[600],
          disabled: tokens.colors.primitive.gray[400],
          inverse: '#ffffff',
        },

        // Interactive colors
        primary: {
          main: resolveColor(tokens.colors.semantic.primary, 600),
          light: resolveColor(tokens.colors.semantic.primary, 100),
          dark: resolveColor(tokens.colors.semantic.primary, 800),
          contrast: '#ffffff',
        },

        secondary: {
          main: tokens.colors.primitive.gray[600],
          light: tokens.colors.primitive.gray[100],
          dark: tokens.colors.primitive.gray[800],
          contrast: '#ffffff',
        },

        // Status colors
        success: {
          main: resolveColor(tokens.colors.semantic.success, 500),
          light: resolveColor(tokens.colors.semantic.success, 50),
          dark: resolveColor(tokens.colors.semantic.success, 600),
          contrast: '#ffffff',
        },

        danger: {
          main: resolveColor(tokens.colors.semantic.danger, 500),
          light: resolveColor(tokens.colors.semantic.danger, 50),
          dark: resolveColor(tokens.colors.semantic.danger, 600),
          contrast: '#ffffff',
        },

        warning: {
          main: resolveColor(tokens.colors.semantic.warning, 500),
          light: resolveColor(tokens.colors.semantic.warning, 50),
          dark: resolveColor(tokens.colors.semantic.warning, 600),
          contrast: '#000000',
        },

        // Border and divider colors
        border: tokens.colors.primitive.gray[200],
        divider: tokens.colors.primitive.gray[200],
      }
    },

    dark: {
      colors: {
        // Surface colors - inverted for dark theme
        background: tokens.colors.primitive.gray[900],
        surface: tokens.colors.primitive.gray[800],
        overlay: 'rgba(0, 0, 0, 0.7)',

        // Text colors - higher contrast for dark theme
        text: {
          primary: tokens.colors.primitive.gray[50],
          secondary: tokens.colors.primitive.gray[300],
          disabled: tokens.colors.primitive.gray[500],
          inverse: tokens.colors.primitive.gray[900],
        },

        // Interactive colors - adjusted for dark theme
        primary: {
          main: resolveColor(tokens.colors.semantic.primary, 400),
          light: resolveColor(tokens.colors.semantic.primary, 900),
          dark: resolveColor(tokens.colors.semantic.primary, 200),
          contrast: tokens.colors.primitive.gray[900],
        },

        secondary: {
          main: tokens.colors.primitive.gray[400],
          light: tokens.colors.primitive.gray[800],
          dark: tokens.colors.primitive.gray[200],
          contrast: tokens.colors.primitive.gray[900],
        },

        success: {
          main: resolveColor(tokens.colors.semantic.success, 400),
          light: resolveColor(tokens.colors.semantic.success, 900),
          dark: resolveColor(tokens.colors.semantic.success, 200),
          contrast: tokens.colors.primitive.gray[900],
        },

        danger: {
          main: resolveColor(tokens.colors.semantic.danger, 400),
          light: resolveColor(tokens.colors.semantic.danger, 900),
          dark: resolveColor(tokens.colors.semantic.danger, 200),
          contrast: tokens.colors.primitive.gray[900],
        },

        warning: {
          main: resolveColor(tokens.colors.semantic.warning, 400),
          light: resolveColor(tokens.colors.semantic.warning, 900),
          dark: resolveColor(tokens.colors.semantic.warning, 200),
          contrast: tokens.colors.primitive.gray[900],
        },

        // Border and divider colors - subtle for dark theme
        border: tokens.colors.primitive.gray[700],
        divider: tokens.colors.primitive.gray[700],
      }
    },

    // High contrast theme for accessibility
    highContrast: {
      colors: {
        background: '#000000',
        surface: '#000000',
        overlay: 'rgba(255, 255, 255, 0.9)',

        text: {
          primary: '#ffffff',
          secondary: '#ffffff',
          disabled: '#888888',
          inverse: '#000000',
        },

        primary: {
          main: '#ffffff',
          light: '#000000',
          dark: '#ffffff',
          contrast: '#000000',
        },

        secondary: {
          main: '#ffffff',
          light: '#000000',
          dark: '#ffffff',
          contrast: '#000000',
        },

        success: {
          main: '#00ff00',
          light: '#000000',
          dark: '#00ff00',
          contrast: '#000000',
        },

        danger: {
          main: '#ff0000',
          light: '#000000',
          dark: '#ff0000',
          contrast: '#ffffff',
        },

        warning: {
          main: '#ffff00',
          light: '#000000',
          dark: '#ffff00',
          contrast: '#000000',
        },

        border: '#ffffff',
        divider: '#ffffff',
      }
    }
  };

  // Merge base theme with variant-specific overrides
  return {
    ...baseTheme,
    ...themeVariants[variant],
    variant, // Include variant name for debugging
  };
};

// ==================== THEME CONTEXT AND STATE MANAGEMENT ====================

// Theme state management using useReducer for complex state logic
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
        theme: buildTheme(action.payload),
      };
    
    case 'TOGGLE_THEME':
      const nextTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        currentTheme: nextTheme,
        theme: buildTheme(nextTheme),
      };
    
    case 'SET_SYSTEM_PREFERENCE':
      return {
        ...state,
        systemPreference: action.payload,
        // If user hasn't set a preference, follow system
        ...(state.userPreference === null && {
          currentTheme: action.payload,
          theme: buildTheme(action.payload),
        }),
      };
    
    case 'SET_USER_PREFERENCE':
      return {
        ...state,
        userPreference: action.payload,
        currentTheme: action.payload || state.systemPreference,
        theme: buildTheme(action.payload || state.systemPreference),
      };
    
    case 'RESET_TO_SYSTEM':
      return {
        ...state,
        userPreference: null,
        currentTheme: state.systemPreference,
        theme: buildTheme(state.systemPreference),
      };

    default:
      return state;
  }
};

// Initial theme state
const getInitialThemeState = () => {
  // Detect system preference
  const systemPreference = typeof window !== 'undefined' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : 'light';

  // Check for saved user preference
  const savedPreference = typeof window !== 'undefined'
    ? localStorage.getItem('theme-preference')
    : null;

  const currentTheme = savedPreference || systemPreference;

  return {
    currentTheme,
    systemPreference,
    userPreference: savedPreference,
    theme: buildTheme(currentTheme),
    availableThemes: ['light', 'dark', 'highContrast'],
  };
};

// Theme context
const ThemeContext = createContext(null);

// ==================== THEME PROVIDER COMPONENT ====================

const CustomThemeProvider = ({ children }) => {
  const [themeState, dispatch] = useReducer(themeReducer, null, getInitialThemeState);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      dispatch({ 
        type: 'SET_SYSTEM_PREFERENCE', 
        payload: e.matches ? 'dark' : 'light' 
      });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Persist user preference to localStorage
  useEffect(() => {
    if (themeState.userPreference !== null) {
      localStorage.setItem('theme-preference', themeState.userPreference);
    } else {
      localStorage.removeItem('theme-preference');
    }
  }, [themeState.userPreference]);

  // Memoize theme context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...themeState,
    setTheme: (theme) => dispatch({ type: 'SET_USER_PREFERENCE', payload: theme }),
    toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
    resetToSystem: () => dispatch({ type: 'RESET_TO_SYSTEM' }),
  }), [themeState]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={themeState.theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
};

// ==================== GLOBAL STYLES WITH THEME TRANSITIONS ====================

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    font-family: ${props => props.theme.fonts.body};
    font-size: ${props => props.theme.fontSizes.base};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background};
    
    /* Smooth theme transitions */
    transition: ${props => props.theme.transitions.normal};
  }

  /* Ensure theme transitions apply to all elements */
  * {
    transition: color ${props => props.theme.transitions.fast}, 
                background-color ${props => props.theme.transitions.fast},
                border-color ${props => props.theme.transitions.fast};
  }

  /* Focus styles that work across all themes */
  *:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  /* Selection styles that match theme */
  ::selection {
    background-color: ${props => props.theme.colors.primary.light};
    color: ${props => props.theme.colors.primary.contrast};
  }
`;

// ==================== THEME-AWARE COMPONENTS ====================

// Button component that adapts to theme
const ThemedButton = styled.button`
  font-family: ${props => props.theme.fonts.body};
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.medium};
  
  padding: ${props => props.theme.space[3]} ${props => props.theme.space[6]};
  border-radius: ${props => props.theme.radii.md};
  border: 2px solid transparent;
  cursor: pointer;
  
  transition: ${props => props.theme.transitions.normal};
  
  /* Variant styles that work across all themes */
  ${props => {
    const variant = props.variant || 'primary';
    const colors = props.theme.colors[variant] || props.theme.colors.primary;
    
    return `
      background-color: ${colors.main};
      color: ${colors.contrast};
      
      &:hover {
        background-color: ${colors.dark};
        transform: translateY(-1px);
        box-shadow: ${props.theme.shadows.md};
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    `;
  }}

  ${props => props.outline && `
    background-color: transparent;
    color: ${props.theme.colors[props.variant || 'primary'].main};
    border-color: ${props.theme.colors[props.variant || 'primary'].main};
    
    &:hover {
      background-color: ${props.theme.colors[props.variant || 'primary'].main};
      color: ${props.theme.colors[props.variant || 'primary'].contrast};
    }
  `}
`;

// Card component with theme-aware styling
const ThemedCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.space[6]};
  box-shadow: ${props => props.theme.shadows.sm};
  
  transition: ${props => props.theme.transitions.normal};
  
  ${props => props.interactive && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}
`;

// Text components with theme integration
const ThemedHeading = styled.h2`
  font-family: ${props => props.theme.fonts.heading};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.space[4]};
  line-height: ${props => props.theme.lineHeights.tight};
`;

const ThemedText = styled.p`
  font-family: ${props => props.theme.fonts.body};
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.muted 
    ? props.theme.colors.text.secondary 
    : props.theme.colors.text.primary
  };
  line-height: ${props => props.theme.lineHeights.normal};
  margin-bottom: ${props => props.theme.space[4]};
`;

// Theme switcher component
const ThemeSwitcher = styled.div`
  display: flex;
  gap: ${props => props.theme.space[2]};
  padding: ${props => props.theme.space[4]};
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

// ==================== EXAMPLE APPLICATION ====================

const ThemeManagementExample = () => {
  const { 
    currentTheme, 
    availableThemes, 
    systemPreference, 
    userPreference,
    setTheme, 
    toggleTheme, 
    resetToSystem 
  } = useTheme();

  const [counter, setCounter] = useState(0);

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
  }, [setTheme]);

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      <GlobalStyle />
      
      <ThemedCard style={{ marginBottom: '2rem' }}>
        <ThemedHeading>Advanced Theme Management System</ThemedHeading>
        <ThemedText>
          This example demonstrates a comprehensive theme management system with
          multiple theme variants, system preference detection, and persistent user preferences.
        </ThemedText>
        
        <ThemeSwitcher>
          <ThemedText style={{ margin: 0, fontSize: '0.875rem' }}>
            Theme:
          </ThemedText>
          {availableThemes.map(theme => (
            <ThemedButton
              key={theme}
              size="small"
              variant={currentTheme === theme ? 'primary' : 'secondary'}
              outline={currentTheme !== theme}
              onClick={() => handleThemeChange(theme)}
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.5rem 1rem',
                textTransform: 'capitalize'
              }}
            >
              {theme}
            </ThemedButton>
          ))}
          
          <ThemedButton
            size="small"
            variant="secondary"
            outline
            onClick={resetToSystem}
            style={{ 
              fontSize: '0.75rem', 
              padding: '0.5rem 1rem' 
            }}
          >
            System Default
          </ThemedButton>
        </ThemeSwitcher>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <ThemedText style={{ fontSize: '0.875rem', margin: 0 }}>
            <strong>Current:</strong> {currentTheme}
          </ThemedText>
          <ThemedText style={{ fontSize: '0.875rem', margin: 0 }}>
            <strong>System:</strong> {systemPreference}
          </ThemedText>
          <ThemedText style={{ fontSize: '0.875rem', margin: 0 }}>
            <strong>User Preference:</strong> {userPreference || 'None'}
          </ThemedText>
        </div>
      </ThemedCard>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <ThemedCard interactive>
          <ThemedHeading style={{ fontSize: '1.25rem' }}>
            Interactive Elements
          </ThemedHeading>
          <ThemedText>
            All components automatically adapt to the current theme.
          </ThemedText>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ThemedButton onClick={() => setCounter(c => c + 1)}>
              Count: {counter}
            </ThemedButton>
            <ThemedButton variant="success" outline>
              Success
            </ThemedButton>
            <ThemedButton variant="danger">
              Danger
            </ThemedButton>
          </div>
        </ThemedCard>

        <ThemedCard>
          <ThemedHeading style={{ fontSize: '1.25rem' }}>
            Status Colors
          </ThemedHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ThemedButton variant="primary" size="small">Primary Action</ThemedButton>
            <ThemedButton variant="success" size="small">Success State</ThemedButton>
            <ThemedButton variant="warning" size="small">Warning State</ThemedButton>
            <ThemedButton variant="danger" size="small">Error State</ThemedButton>
          </div>
        </ThemedCard>
      </div>

      <ThemedCard>
        <ThemedHeading style={{ fontSize: '1.25rem' }}>
          Theme Persistence Features
        </ThemedHeading>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>
            <ThemedText style={{ margin: '0.5rem 0' }}>
              Automatic system preference detection
            </ThemedText>
          </li>
          <li>
            <ThemedText style={{ margin: '0.5rem 0' }}>
              User preference persistence across browser sessions
            </ThemedText>
          </li>
          <li>
            <ThemedText style={{ margin: '0.5rem 0' }}>
              Smooth transitions between theme switches
            </ThemedText>
          </li>
          <li>
            <ThemedText style={{ margin: '0.5rem 0' }}>
              Support for high contrast accessibility themes
            </ThemedText>
          </li>
          <li>
            <ThemedText style={{ margin: '0.5rem 0' }}>
              Cross-tab synchronization of theme changes
            </ThemedText>
          </li>
        </ul>
        
        <div style={{ marginTop: '1.5rem' }}>
          <ThemedButton onClick={toggleTheme}>
            Quick Toggle (Light/Dark)
          </ThemedButton>
        </div>
      </ThemedCard>
    </div>
  );
};

// ==================== USAGE PATTERNS AND BEST PRACTICES ====================
/*
1. DESIGN TOKEN ARCHITECTURE:
   - Define primitive colors and semantic mappings
   - Use consistent scales for spacing, typography, and sizing
   - Create theme variants by overriding semantic colors only

2. THEME STATE MANAGEMENT:
   - Use useReducer for complex theme state logic
   - Implement system preference detection and persistence
   - Memoize context values to prevent unnecessary re-renders

3. COMPONENT INTEGRATION:
   - Create theme-aware components using semantic color names
   - Implement smooth transitions for theme switches
   - Ensure accessibility across all theme variants

4. PERFORMANCE OPTIMIZATION:
   - Memoize theme objects and context values
   - Use CSS custom properties for better transition performance
   - Implement lazy loading for theme variants not initially used

5. ACCESSIBILITY CONSIDERATIONS:
   - Support high contrast themes for accessibility
   - Ensure adequate color contrast in all theme variants
   - Respect user's reduced motion preferences

6. TESTING STRATEGIES:
   - Test component appearance across all theme variants
   - Verify theme persistence and system preference handling
   - Test smooth transitions and performance under theme changes
*/

// Main component wrapped with theme provider
const App = () => (
  <CustomThemeProvider>
    <ThemeManagementExample />
  </CustomThemeProvider>
);

export default App;
export { 
  CustomThemeProvider, 
  useTheme, 
  buildTheme, 
  designTokens,
  ThemedButton,
  ThemedCard,
  ThemedHeading,
  ThemedText
};