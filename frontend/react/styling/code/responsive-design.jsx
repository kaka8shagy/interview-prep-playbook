/**
 * File: responsive-design.jsx
 * Description: Comprehensive responsive design patterns using CSS-in-JS
 * 
 * Learning objectives:
 * - Master mobile-first responsive design principles
 * - Implement flexible grid systems and layout patterns
 * - Create responsive typography and spacing systems
 * - Handle responsive images and media optimization
 * 
 * Key Concepts:
 * - Mobile-first breakpoint system design
 * - Container queries and element-based responsive design
 * - Fluid typography and spacing using CSS clamp()
 * - Responsive component patterns and composition
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { css, ThemeProvider } from 'styled-components';

// ==================== RESPONSIVE THEME CONFIGURATION ====================
// Mobile-first breakpoint system with semantic naming
const responsiveTheme = {
  // Breakpoints defined mobile-first (min-width)
  breakpoints: {
    xs: '320px',   // Small phones
    sm: '576px',   // Large phones
    md: '768px',   // Tablets
    lg: '992px',   // Small laptops
    xl: '1200px',  // Desktop
    xxl: '1400px', // Large desktop
  },

  // Container max-widths for centered content
  containers: {
    xs: '100%',
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    xxl: '1320px',
  },

  // Responsive spacing scale
  spacing: {
    xs: { mobile: '8px', tablet: '12px', desktop: '16px' },
    sm: { mobile: '12px', tablet: '16px', desktop: '20px' },
    md: { mobile: '16px', tablet: '24px', desktop: '32px' },
    lg: { mobile: '24px', tablet: '32px', desktop: '48px' },
    xl: { mobile: '32px', tablet: '48px', desktop: '64px' },
  },

  // Responsive typography system
  typography: {
    fontSizes: {
      xs: { mobile: '12px', tablet: '13px', desktop: '14px' },
      sm: { mobile: '14px', tablet: '15px', desktop: '16px' },
      base: { mobile: '16px', tablet: '17px', desktop: '18px' },
      lg: { mobile: '18px', tablet: '20px', desktop: '22px' },
      xl: { mobile: '20px', tablet: '24px', desktop: '28px' },
      '2xl': { mobile: '24px', tablet: '30px', desktop: '36px' },
      '3xl': { mobile: '30px', tablet: '36px', desktop: '48px' },
      '4xl': { mobile: '36px', tablet: '48px', desktop: '60px' },
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    }
  },

  // Grid system configuration
  grid: {
    columns: 12,
    gutter: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
    margins: {
      mobile: '16px',
      tablet: '32px',
      desktop: '48px',
    }
  },

  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb',
  }
};

// ==================== RESPONSIVE UTILITY FUNCTIONS ====================

// Media query generator for consistent breakpoint usage
const media = {
  above: (breakpoint) => `@media (min-width: ${responsiveTheme.breakpoints[breakpoint]})`,
  below: (breakpoint) => {
    // Get the next smaller breakpoint
    const breakpoints = Object.values(responsiveTheme.breakpoints);
    const index = breakpoints.indexOf(responsiveTheme.breakpoints[breakpoint]);
    const maxWidth = index > 0 ? breakpoints[index - 1] : '0px';
    return `@media (max-width: ${maxWidth})`;
  },
  between: (min, max) => `@media (min-width: ${responsiveTheme.breakpoints[min]}) and (max-width: ${responsiveTheme.breakpoints[max]})`,
  // Container queries (when supported)
  container: (minWidth) => `@container (min-width: ${minWidth})`,
};

// Responsive value function - returns different values at different breakpoints
const responsive = (values) => {
  if (typeof values === 'string' || typeof values === 'number') {
    return values;
  }

  return css`
    /* Mobile first (default) */
    ${values.mobile && css`
      ${typeof values.mobile === 'object' 
        ? css(values.mobile) 
        : values.mobile
      }
    `}

    /* Tablet and up */
    ${values.tablet && css`
      ${media.above('md')} {
        ${typeof values.tablet === 'object' 
          ? css(values.tablet) 
          : values.tablet
        }
      }
    `}

    /* Desktop and up */
    ${values.desktop && css`
      ${media.above('lg')} {
        ${typeof values.desktop === 'object' 
          ? css(values.desktop) 
          : values.desktop
        }
      }
    }
    `}
  `;
};

// Fluid typography using CSS clamp()
const fluidType = (minSize, maxSize, minViewport = '320px', maxViewport = '1200px') => {
  return `clamp(${minSize}, ${minSize} + (${parseFloat(maxSize)} - ${parseFloat(minSize)}) * ((100vw - ${minViewport}) / (${parseFloat(maxViewport)} - ${parseFloat(minViewport)})), ${maxSize})`;
};

// ==================== RESPONSIVE LAYOUT COMPONENTS ====================

// Responsive container with max-width constraints
const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 ${responsiveTheme.grid.margins.mobile};

  ${media.above('md')} {
    padding: 0 ${responsiveTheme.grid.margins.tablet};
    max-width: ${responsiveTheme.containers.md};
  }

  ${media.above('lg')} {
    padding: 0 ${responsiveTheme.grid.margins.desktop};
    max-width: ${responsiveTheme.containers.lg};
  }

  ${media.above('xl')} {
    max-width: ${responsiveTheme.containers.xl};
  }

  ${media.above('xxl')} {
    max-width: ${responsiveTheme.containers.xxl};
  }

  /* Fluid container variant */
  ${props => props.fluid && css`
    max-width: none;
  `}
`;

// CSS Grid-based responsive grid system
const Grid = styled.div`
  display: grid;
  gap: ${responsiveTheme.grid.gutter.mobile};
  
  /* Default: single column on mobile */
  grid-template-columns: 1fr;

  ${media.above('sm')} {
    gap: ${responsiveTheme.grid.gutter.tablet};
    /* Small screens: use sm prop or default to 2 columns */
    grid-template-columns: repeat(${props => props.sm || 2}, 1fr);
  }

  ${media.above('md')} {
    gap: ${responsiveTheme.grid.gutter.desktop};
    /* Medium screens: use md prop or sm prop or default to 3 columns */
    grid-template-columns: repeat(${props => props.md || props.sm || 3}, 1fr);
  }

  ${media.above('lg')} {
    /* Large screens: use lg prop or md prop or sm prop or default to 4 columns */
    grid-template-columns: repeat(${props => props.lg || props.md || props.sm || 4}, 1fr);
  }

  /* Custom column configuration */
  ${props => props.columns && css`
    grid-template-columns: ${props.columns};
  `}

  /* Auto-fit columns based on minimum width */
  ${props => props.minItemWidth && css`
    grid-template-columns: repeat(auto-fit, minmax(${props.minItemWidth}, 1fr));
  `}
`;

// Flexible box layout with responsive direction and alignment
const Flex = styled.div`
  display: flex;
  
  /* Responsive direction */
  ${responsive({
    mobile: props => `flex-direction: ${props.direction || 'column'};`,
    tablet: props => props.mdDirection && `flex-direction: ${props.mdDirection};`,
    desktop: props => props.lgDirection && `flex-direction: ${props.lgDirection};`,
  })}

  /* Responsive gap */
  gap: ${props => responsive({
    mobile: responsiveTheme.spacing[props.gap || 'md'].mobile,
    tablet: responsiveTheme.spacing[props.gap || 'md'].tablet,
    desktop: responsiveTheme.spacing[props.gap || 'md'].desktop,
  })};

  /* Alignment props */
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  flex-wrap: ${props => props.wrap || 'nowrap'};

  /* Responsive wrap */
  ${props => props.responsive && css`
    ${media.below('md')} {
      flex-wrap: wrap;
    }
  `}
`;

// ==================== RESPONSIVE TYPOGRAPHY COMPONENTS ====================

const ResponsiveHeading = styled.h1`
  font-weight: 700;
  line-height: ${responsiveTheme.typography.lineHeights.tight};
  color: ${responsiveTheme.colors.text};
  margin-bottom: ${responsive({
    mobile: responsiveTheme.spacing.md.mobile,
    tablet: responsiveTheme.spacing.md.tablet,
    desktop: responsiveTheme.spacing.md.desktop,
  })};

  /* Fluid typography using clamp() */
  font-size: ${props => {
    const size = props.size || '2xl';
    const sizes = responsiveTheme.typography.fontSizes[size];
    return fluidType(sizes.mobile, sizes.desktop);
  }};

  /* Level-based sizing */
  ${props => props.level === 1 && css`
    font-size: ${fluidType('30px', '60px')};
  `}

  ${props => props.level === 2 && css`
    font-size: ${fluidType('24px', '48px')};
  `}

  ${props => props.level === 3 && css`
    font-size: ${fluidType('20px', '36px')};
  `}

  ${props => props.level === 4 && css`
    font-size: ${fluidType('18px', '28px')};
  `}

  /* Center alignment on mobile if specified */
  ${props => props.centerOnMobile && css`
    text-align: center;
    
    ${media.above('md')} {
      text-align: left;
    }
  `}
`;

const ResponsiveText = styled.p`
  line-height: ${responsiveTheme.typography.lineHeights.normal};
  color: ${props => props.muted ? responsiveTheme.colors.textLight : responsiveTheme.colors.text};
  margin-bottom: ${responsive({
    mobile: responsiveTheme.spacing.sm.mobile,
    tablet: responsiveTheme.spacing.sm.tablet,
    desktop: responsiveTheme.spacing.sm.desktop,
  })};

  /* Responsive font size */
  font-size: ${responsive({
    mobile: responsiveTheme.typography.fontSizes.base.mobile,
    tablet: responsiveTheme.typography.fontSizes.base.tablet,
    desktop: responsiveTheme.typography.fontSizes.base.desktop,
  })};

  ${props => props.large && css`
    font-size: ${responsive({
      mobile: responsiveTheme.typography.fontSizes.lg.mobile,
      tablet: responsiveTheme.typography.fontSizes.lg.tablet,
      desktop: responsiveTheme.typography.fontSizes.lg.desktop,
    })};
  `}
`;

// ==================== RESPONSIVE CARD COMPONENT ====================

const ResponsiveCard = styled.div`
  background-color: ${responsiveTheme.colors.surface};
  border: 1px solid ${responsiveTheme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;

  /* Responsive padding */
  padding: ${responsive({
    mobile: responsiveTheme.spacing.md.mobile,
    tablet: responsiveTheme.spacing.lg.tablet,
    desktop: responsiveTheme.spacing.lg.desktop,
  })};

  /* Interactive hover effects only on non-touch devices */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
  }

  /* Stack layout on mobile, horizontal on desktop */
  ${props => props.horizontal && css`
    display: flex;
    flex-direction: column;

    ${media.above('md')} {
      flex-direction: row;
      align-items: center;
      gap: ${responsiveTheme.spacing.lg.desktop};
    }
  `}
`;

// ==================== RESPONSIVE IMAGE COMPONENT ====================

const ResponsiveImage = styled.img`
  width: 100%;
  height: auto;
  display: block;

  /* Responsive aspect ratios */
  ${props => props.aspectRatio && css`
    aspect-ratio: ${props.aspectRatio};
    object-fit: cover;
  `}

  /* Different aspect ratios at different breakpoints */
  ${props => props.responsive && css`
    aspect-ratio: 4/3; /* Mobile: more square */

    ${media.above('md')} {
      aspect-ratio: 16/9; /* Desktop: more widescreen */
    }
  `}

  /* Responsive sizing */
  ${props => props.size && responsive({
    mobile: `width: ${props.size.mobile || '100%'};`,
    tablet: `width: ${props.size.tablet || '100%'};`,
    desktop: `width: ${props.size.desktop || '100%'};`,
  })}
`;

// ==================== RESPONSIVE NAVIGATION COMPONENT ====================

const ResponsiveNav = styled.nav`
  background-color: ${responsiveTheme.colors.surface};
  border-bottom: 1px solid ${responsiveTheme.colors.border};
  padding: ${responsiveTheme.spacing.sm.mobile} 0;

  ${media.above('md')} {
    padding: ${responsiveTheme.spacing.md.desktop} 0;
  }
`;

const NavContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: none; /* Hidden on mobile by default */

  ${media.above('md')} {
    display: flex;
    gap: ${responsiveTheme.spacing.lg.desktop};
  }

  /* Mobile menu when open */
  ${props => props.open && css`
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${responsiveTheme.colors.surface};
    flex-direction: column;
    padding: ${responsiveTheme.spacing.md.mobile};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    ${media.above('md')} {
      position: static;
      flex-direction: row;
      padding: 0;
      box-shadow: none;
    }
  `}
`;

const MobileMenuButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  ${media.above('md')} {
    display: none;
  }

  span {
    width: 24px;
    height: 2px;
    background-color: ${responsiveTheme.colors.text};
    transition: all 0.3s ease;
    transform-origin: 1px;

    ${props => props.open && css`
      &:first-child {
        transform: rotate(45deg);
      }

      &:nth-child(2) {
        opacity: 0;
        transform: translateX(20px);
      }

      &:nth-child(3) {
        transform: rotate(-45deg);
      }
    `}
  }
`;

// ==================== RESPONSIVE HOOKS ====================

// Custom hook for responsive breakpoint detection
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= 1400) setBreakpoint('xxl');
      else if (width >= 1200) setBreakpoint('xl');
      else if (width >= 992) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 576) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

// Custom hook for responsive values
const useResponsiveValue = (values) => {
  const breakpoint = useBreakpoint();
  
  return useMemo(() => {
    if (typeof values === 'string' || typeof values === 'number') {
      return values;
    }

    // Return the appropriate value for current breakpoint
    if (breakpoint === 'xxl' && values.xxl) return values.xxl;
    if (['xxl', 'xl'].includes(breakpoint) && values.xl) return values.xl;
    if (['xxl', 'xl', 'lg'].includes(breakpoint) && values.lg) return values.lg;
    if (['xxl', 'xl', 'lg', 'md'].includes(breakpoint) && values.md) return values.md;
    if (['xxl', 'xl', 'lg', 'md', 'sm'].includes(breakpoint) && values.sm) return values.sm;
    
    return values.xs || values.mobile || values;
  }, [values, breakpoint]);
};

// ==================== EXAMPLE APPLICATION ====================

const ResponsiveExample = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const breakpoint = useBreakpoint();
  
  // Responsive grid columns based on breakpoint
  const gridColumns = useResponsiveValue({
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Sample data for demonstration
  const cardData = [
    { id: 1, title: 'Mobile First', description: 'Design starts with mobile devices and scales up.' },
    { id: 2, title: 'Flexible Grids', description: 'Use CSS Grid and Flexbox for adaptive layouts.' },
    { id: 3, title: 'Fluid Typography', description: 'Typography that scales smoothly across devices.' },
    { id: 4, title: 'Touch Friendly', description: 'Optimized interactions for touch interfaces.' },
    { id: 5, title: 'Performance', description: 'Optimized for various network conditions.' },
    { id: 6, title: 'Accessibility', description: 'Works well across different abilities and devices.' },
  ];

  return (
    <ThemeProvider theme={responsiveTheme}>
      <div>
        {/* Responsive Navigation */}
        <ResponsiveNav>
          <NavContainer>
            <ResponsiveHeading level={4} style={{ margin: 0 }}>
              ResponsiveApp
            </ResponsiveHeading>
            
            <MobileMenuButton open={mobileMenuOpen} onClick={toggleMobileMenu}>
              <span />
              <span />
              <span />
            </MobileMenuButton>

            <NavLinks open={mobileMenuOpen}>
              <a href="#home" style={{ color: responsiveTheme.colors.text, textDecoration: 'none' }}>
                Home
              </a>
              <a href="#about" style={{ color: responsiveTheme.colors.text, textDecoration: 'none' }}>
                About
              </a>
              <a href="#services" style={{ color: responsiveTheme.colors.text, textDecoration: 'none' }}>
                Services
              </a>
              <a href="#contact" style={{ color: responsiveTheme.colors.text, textDecoration: 'none' }}>
                Contact
              </a>
            </NavLinks>
          </NavContainer>
        </ResponsiveNav>

        {/* Hero Section */}
        <Container>
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <ResponsiveHeading level={1} centerOnMobile>
              Responsive Design Patterns
            </ResponsiveHeading>
            <ResponsiveText large style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
              Comprehensive examples of responsive design using CSS-in-JS. 
              Currently viewing on: <strong>{breakpoint}</strong> breakpoint.
            </ResponsiveText>
            
            <Flex justify="center" wrap="wrap" gap="sm">
              <button style={{
                padding: responsive({
                  mobile: '12px 24px',
                  tablet: '14px 28px',
                  desktop: '16px 32px',
                }),
                backgroundColor: responsiveTheme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                Primary Action
              </button>
              <button style={{
                padding: responsive({
                  mobile: '12px 24px',
                  tablet: '14px 28px',
                  desktop: '16px 32px',
                }),
                backgroundColor: 'transparent',
                color: responsiveTheme.colors.primary,
                border: `2px solid ${responsiveTheme.colors.primary}`,
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                Secondary Action
              </button>
            </Flex>
          </div>
        </Container>

        {/* Responsive Grid Section */}
        <div style={{ backgroundColor: responsiveTheme.colors.surface, padding: '4rem 0' }}>
          <Container>
            <ResponsiveHeading level={2} centerOnMobile>
              Adaptive Grid System
            </ResponsiveHeading>
            <ResponsiveText style={{ textAlign: 'center', marginBottom: '3rem' }}>
              This grid automatically adjusts: {gridColumns} column{gridColumns > 1 ? 's' : ''} on {breakpoint} devices
            </ResponsiveText>
            
            <Grid sm={2} md={2} lg={3} xl={4}>
              {cardData.map(card => (
                <ResponsiveCard key={card.id}>
                  <ResponsiveHeading level={4}>
                    {card.title}
                  </ResponsiveHeading>
                  <ResponsiveText>
                    {card.description}
                  </ResponsiveText>
                </ResponsiveCard>
              ))}
            </Grid>
          </Container>
        </div>

        {/* Responsive Image Section */}
        <Container>
          <div style={{ padding: '4rem 0' }}>
            <ResponsiveHeading level={2} centerOnMobile>
              Responsive Media
            </ResponsiveHeading>
            
            <Flex direction="column" mdDirection="row" gap="lg" align="center">
              <div style={{ flex: '1' }}>
                <ResponsiveImage
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%236b7280' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EResponsive Image%3C/text%3E%3C/svg%3E"
                  alt="Responsive demonstration"
                  responsive
                />
              </div>
              <div style={{ flex: '1' }}>
                <ResponsiveHeading level={3}>
                  Smart Image Handling
                </ResponsiveHeading>
                <ResponsiveText>
                  Images automatically adapt their aspect ratios based on the viewport:
                </ResponsiveText>
                <ul>
                  <li>
                    <ResponsiveText>
                      Mobile: 4:3 aspect ratio for better mobile viewing
                    </ResponsiveText>
                  </li>
                  <li>
                    <ResponsiveText>
                      Desktop: 16:9 widescreen format
                    </ResponsiveText>
                  </li>
                  <li>
                    <ResponsiveText>
                      Automatic sizing and optimization
                    </ResponsiveText>
                  </li>
                </ul>
              </div>
            </Flex>
          </div>
        </Container>

        {/* Responsive Typography Section */}
        <div style={{ backgroundColor: responsiveTheme.colors.surface, padding: '4rem 0' }}>
          <Container>
            <ResponsiveHeading level={1}>
              Fluid Typography Scale
            </ResponsiveHeading>
            <ResponsiveHeading level={2}>
              Heading Level 2
            </ResponsiveHeading>
            <ResponsiveHeading level={3}>
              Heading Level 3
            </ResponsiveHeading>
            <ResponsiveHeading level={4}>
              Heading Level 4
            </ResponsiveHeading>
            <ResponsiveText>
              This paragraph text scales smoothly between breakpoints using CSS clamp() 
              function. The typography system ensures optimal reading experience across 
              all device sizes.
            </ResponsiveText>
            <ResponsiveText large>
              Large text variant that also scales responsively for enhanced readability 
              and visual hierarchy.
            </ResponsiveText>
            <ResponsiveText muted>
              Muted text color for secondary content that maintains proper contrast 
              ratios across all themes.
            </ResponsiveText>
          </Container>
        </div>
      </div>
    </ThemeProvider>
  );
};

// ==================== RESPONSIVE DESIGN BEST PRACTICES ====================
/*
1. MOBILE-FIRST APPROACH:
   - Start with mobile styles as base
   - Use min-width media queries to enhance for larger screens
   - Test on actual devices, not just browser dev tools

2. FLEXIBLE GRID SYSTEMS:
   - Use CSS Grid for two-dimensional layouts
   - Use Flexbox for one-dimensional layouts
   - Implement responsive gap and spacing

3. FLUID TYPOGRAPHY:
   - Use clamp() for smooth scaling between breakpoints
   - Maintain readable line lengths (45-75 characters)
   - Ensure adequate contrast at all sizes

4. TOUCH-FRIENDLY INTERACTIONS:
   - Minimum 44px touch target size
   - Use hover queries to differentiate touch vs pointer devices
   - Provide visual feedback for touch interactions

5. PERFORMANCE CONSIDERATIONS:
   - Optimize images for different screen densities
   - Use responsive images with srcset and sizes
   - Consider loading strategies for off-screen content

6. ACCESSIBILITY ACROSS DEVICES:
   - Ensure keyboard navigation works on all devices
   - Test with screen readers on mobile devices
   - Maintain focus visibility across breakpoints

7. TESTING STRATEGIES:
   - Test on real devices, not just simulators
   - Use browser dev tools for initial development
   - Test landscape and portrait orientations
   - Verify performance on slower devices
*/

export default ResponsiveExample;
export {
  Container,
  Grid,
  Flex,
  ResponsiveHeading,
  ResponsiveText,
  ResponsiveCard,
  ResponsiveImage,
  useBreakpoint,
  useResponsiveValue,
  media,
  responsive,
  fluidType,
  responsiveTheme
};