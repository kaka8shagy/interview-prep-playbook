/**
 * File: hoc-basics.jsx
 * Description: Basic Higher-Order Component (HOC) patterns in React
 * Tests understanding of function composition and component enhancement
 */

import React, { useState, useEffect } from 'react';

// === Basic HOC Structure ===
// A Higher-Order Component is a function that takes a component and returns a new component

function withBasicEnhancement(WrappedComponent) {
  // Return a new component
  function EnhancedComponent(props) {
    console.log('HOC: Rendering enhanced component');
    
    // Add some enhancement logic here
    const enhancement = {
      timestamp: new Date().toISOString(),
      renderCount: Math.random()
    };
    
    // Render the wrapped component with original props + enhancements
    return (
      <div className="enhanced-wrapper">
        <WrappedComponent {...props} enhancement={enhancement} />
      </div>
    );
  }
  
  // Set displayName for debugging (React DevTools)
  EnhancedComponent.displayName = `withBasicEnhancement(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return EnhancedComponent;
}

// === Logging HOC ===
function withLogging(WrappedComponent) {
  function LoggedComponent(props) {
    useEffect(() => {
      console.log(`${WrappedComponent.name} mounted`);
      return () => {
        console.log(`${WrappedComponent.name} unmounted`);
      };
    }, []);
    
    useEffect(() => {
      console.log(`${WrappedComponent.name} props updated:`, props);
    });
    
    return <WrappedComponent {...props} />;
  }
  
  LoggedComponent.displayName = `withLogging(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return LoggedComponent;
}

// === Props Manipulation HOC ===
function withPropsMapping(mapProps) {
  return function(WrappedComponent) {
    function MappedComponent(props) {
      // Transform props using the mapping function
      const mappedProps = mapProps(props);
      
      return <WrappedComponent {...mappedProps} />;
    }
    
    MappedComponent.displayName = `withPropsMapping(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return MappedComponent;
  };
}

// === Conditional Rendering HOC ===
function withConditionalRendering(condition) {
  return function(WrappedComponent) {
    function ConditionalComponent(props) {
      // Evaluate condition - can be a function or boolean
      const shouldRender = typeof condition === 'function' ? condition(props) : condition;
      
      if (!shouldRender) {
        return <div>Component not rendered due to condition</div>;
      }
      
      return <WrappedComponent {...props} />;
    }
    
    ConditionalComponent.displayName = `withConditionalRendering(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return ConditionalComponent;
  };
}

// === Loading State HOC ===
function withLoadingState(WrappedComponent) {
  function LoadingComponent(props) {
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }, []);
    
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    return <WrappedComponent {...props} />;
  }
  
  LoadingComponent.displayName = `withLoadingState(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return LoadingComponent;
}

// === Static Method Hoisting HOC ===
function withStaticHoisting(WrappedComponent) {
  function HoistedComponent(props) {
    return <WrappedComponent {...props} />;
  }
  
  // Copy static methods from wrapped component to HOC
  Object.keys(WrappedComponent).forEach(key => {
    if (key !== 'length' && key !== 'name' && key !== 'prototype') {
      HoistedComponent[key] = WrappedComponent[key];
    }
  });
  
  HoistedComponent.displayName = `withStaticHoisting(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return HoistedComponent;
}

// === Ref Forwarding HOC ===
const withRefForwarding = React.forwardRef((WrappedComponent) => {
  const RefForwardingComponent = React.forwardRef((props, ref) => {
    return <WrappedComponent {...props} ref={ref} />;
  });
  
  RefForwardingComponent.displayName = `withRefForwarding(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return RefForwardingComponent;
});

// === Sample Components to Enhance ===

// Basic component
function BasicButton({ children, enhancement, onClick }) {
  return (
    <button onClick={onClick} className="basic-button">
      {children}
      {enhancement && (
        <small> (Enhanced at: {enhancement.timestamp})</small>
      )}
    </button>
  );
}

// Component with static method
function StaticMethodComponent({ message }) {
  return <div>{message}</div>;
}

StaticMethodComponent.staticMethod = function() {
  return 'This is a static method';
};

// Component that uses ref
const RefComponent = React.forwardRef(({ message }, ref) => {
  return <div ref={ref}>{message}</div>;
});

// === Enhanced Components ===

// Apply single HOC
const EnhancedBasicButton = withBasicEnhancement(BasicButton);

// Apply multiple HOCs
const LoggedLoadingButton = withLogging(withLoadingState(BasicButton));

// Apply HOC with configuration
const ConditionalButton = withConditionalRendering((props) => props.show)(BasicButton);

// Apply props mapping
const MappedButton = withPropsMapping((props) => ({
  ...props,
  children: props.children.toUpperCase(),
  className: 'mapped-button'
}))(BasicButton);

// Static method preservation
const HoistedComponent = withStaticHoisting(StaticMethodComponent);

// Ref forwarding
const ForwardedRefComponent = withRefForwarding(RefComponent);

// === Demo Component ===
function HOCBasicsDemo() {
  const [show, setShow] = useState(true);
  const [componentRef, setComponentRef] = useState(null);
  
  useEffect(() => {
    if (componentRef) {
      console.log('Ref received:', componentRef);
    }
  }, [componentRef]);
  
  return (
    <div className="hoc-demo">
      <h1>Higher-Order Components Demo</h1>
      
      <section>
        <h2>Basic Enhancement</h2>
        <EnhancedBasicButton onClick={() => console.log('Enhanced button clicked')}>
          Enhanced Button
        </EnhancedBasicButton>
      </section>
      
      <section>
        <h2>Multiple HOCs</h2>
        <LoggedLoadingButton onClick={() => console.log('Logged loading button clicked')}>
          Logged Loading Button
        </LoggedLoadingButton>
      </section>
      
      <section>
        <h2>Conditional Rendering</h2>
        <label>
          <input 
            type="checkbox" 
            checked={show} 
            onChange={(e) => setShow(e.target.checked)} 
          />
          Show conditional button
        </label>
        <ConditionalButton show={show}>
          Conditional Button
        </ConditionalButton>
      </section>
      
      <section>
        <h2>Props Mapping</h2>
        <MappedButton onClick={() => console.log('Mapped button clicked')}>
          mapped button text
        </MappedButton>
      </section>
      
      <section>
        <h2>Static Method Hoisting</h2>
        <HoistedComponent message="Component with static method" />
        <p>Static method result: {HoistedComponent.staticMethod()}</p>
      </section>
      
      <section>
        <h2>Ref Forwarding</h2>
        <ForwardedRefComponent 
          ref={setComponentRef}
          message="Component with forwarded ref" 
        />
      </section>
    </div>
  );
}

// === HOC Composition Utility ===
function compose(...hocs) {
  return (WrappedComponent) => {
    return hocs.reduceRight((acc, hoc) => hoc(acc), WrappedComponent);
  };
}

// Example of composed HOCs
const ComposedButton = compose(
  withLogging,
  withLoadingState,
  withBasicEnhancement
)(BasicButton);

// === HOC Best Practices Examples ===

// ✅ Good: Pure HOC function
function withGoodPractices(WrappedComponent) {
  function GoodHOC(props) {
    // Don't mutate the original component
    // Don't use HOCs inside render method
    // Always copy static methods if needed
    return <WrappedComponent {...props} />;
  }
  
  // Always set displayName
  GoodHOC.displayName = `withGoodPractices(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GoodHOC;
}

// ❌ Bad: Mutating component inside HOC
function withBadPractices(WrappedComponent) {
  // Don't do this - mutates the original component
  WrappedComponent.prototype.badMethod = function() {
    return 'This is bad practice';
  };
  
  return WrappedComponent; // Returns mutated original
}

export default HOCBasicsDemo;
export {
  withBasicEnhancement,
  withLogging,
  withPropsMapping,
  withConditionalRendering,
  withLoadingState,
  withStaticHoisting,
  withRefForwarding,
  compose,
  ComposedButton,
  EnhancedBasicButton,
  LoggedLoadingButton,
  ConditionalButton,
  MappedButton
};