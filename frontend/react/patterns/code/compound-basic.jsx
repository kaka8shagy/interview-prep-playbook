/**
 * File: compound-basic.jsx
 * Description: Basic Compound Components pattern in React
 * Tests understanding of component composition and implicit state sharing
 */

import React, { useState, cloneElement, Children } from 'react';

// === Basic Compound Component Pattern ===
// Components that work together to form a cohesive interface

function BasicAccordion({ children, allowMultiple = false }) {
  const [openSections, setOpenSections] = useState(new Set());
  
  const toggleSection = (sectionId) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(sectionId);
      }
      
      return newSet;
    });
  };
  
  // Clone children and pass down shared state and handlers
  return (
    <div className="accordion">
      {Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return cloneElement(child, {
            id: child.props.id || `section-${index}`,
            isOpen: openSections.has(child.props.id || `section-${index}`),
            onToggle: toggleSection
          });
        }
        return child;
      })}
    </div>
  );
}

function AccordionSection({ id, isOpen, onToggle, children, title }) {
  return (
    <div className="accordion-section">
      <AccordionHeader id={id} isOpen={isOpen} onToggle={onToggle}>
        {title}
      </AccordionHeader>
      <AccordionContent isOpen={isOpen}>
        {children}
      </AccordionContent>
    </div>
  );
}

function AccordionHeader({ id, isOpen, onToggle, children }) {
  return (
    <button 
      className={`accordion-header ${isOpen ? 'open' : ''}`}
      onClick={() => onToggle && onToggle(id)}
    >
      {children}
      <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
    </button>
  );
}

function AccordionContent({ isOpen, children }) {
  return (
    <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="accordion-content-inner">
          {children}
        </div>
      )}
    </div>
  );
}

// Attach subcomponents as static properties
BasicAccordion.Section = AccordionSection;
BasicAccordion.Header = AccordionHeader;
BasicAccordion.Content = AccordionContent;

// === Stepper Component ===
function Stepper({ children, currentStep, onStepChange }) {
  const steps = Children.toArray(children);
  
  const goToStep = (stepIndex) => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };
  
  return (
    <div className="stepper">
      <StepperNav 
        steps={steps.length}
        currentStep={currentStep}
        onStepClick={goToStep}
      />
      <StepperContent>
        {Children.map(children, (child, index) => 
          cloneElement(child, {
            isActive: index === currentStep,
            isCompleted: index < currentStep,
            stepIndex: index,
            nextStep,
            prevStep
          })
        )}
      </StepperContent>
    </div>
  );
}

function StepperNav({ steps, currentStep, onStepClick }) {
  return (
    <nav className="stepper-nav">
      {Array.from({ length: steps }, (_, index) => (
        <button
          key={index}
          className={`stepper-nav-item ${
            index === currentStep ? 'active' : 
            index < currentStep ? 'completed' : ''
          }`}
          onClick={() => onStepClick(index)}
        >
          Step {index + 1}
        </button>
      ))}
    </nav>
  );
}

function StepperContent({ children }) {
  return (
    <div className="stepper-content">
      {children}
    </div>
  );
}

function Step({ isActive, isCompleted, stepIndex, children, nextStep, prevStep }) {
  if (!isActive) return null;
  
  return (
    <div className="step">
      <div className="step-content">
        {typeof children === 'function' 
          ? children({ stepIndex, nextStep, prevStep, isCompleted })
          : children
        }
      </div>
      <div className="step-actions">
        <button onClick={prevStep} disabled={stepIndex === 0}>
          Previous
        </button>
        <button onClick={nextStep}>
          Next
        </button>
      </div>
    </div>
  );
}

Stepper.Nav = StepperNav;
Stepper.Content = StepperContent;
Stepper.Step = Step;

// === Card Component System ===
function Card({ children, variant = 'default', onClick }) {
  return (
    <div className={`card card-${variant}`} onClick={onClick}>
      {children}
    </div>
  );
}

function CardHeader({ children, actions }) {
  return (
    <div className="card-header">
      <div className="card-header-content">{children}</div>
      {actions && <div className="card-header-actions">{actions}</div>}
    </div>
  );
}

function CardBody({ children, padding = 'normal' }) {
  return (
    <div className={`card-body card-body-${padding}`}>
      {children}
    </div>
  );
}

function CardFooter({ children, align = 'right' }) {
  return (
    <div className={`card-footer card-footer-${align}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// === Menu Component System ===
function Menu({ children, orientation = 'vertical' }) {
  const [selectedItem, setSelectedItem] = useState(null);
  
  return (
    <div className={`menu menu-${orientation}`}>
      {Children.map(children, (child, index) => 
        cloneElement(child, {
          isSelected: selectedItem === index,
          onSelect: () => setSelectedItem(index),
          index
        })
      )}
    </div>
  );
}

function MenuItem({ children, isSelected, onSelect, disabled = false, icon }) {
  return (
    <button
      className={`menu-item ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onSelect}
      disabled={disabled}
    >
      {icon && <span className="menu-item-icon">{icon}</span>}
      <span className="menu-item-text">{children}</span>
    </button>
  );
}

function MenuGroup({ children, title }) {
  return (
    <div className="menu-group">
      {title && <div className="menu-group-title">{title}</div>}
      <div className="menu-group-items">
        {children}
      </div>
    </div>
  );
}

function MenuDivider() {
  return <div className="menu-divider" />;
}

Menu.Item = MenuItem;
Menu.Group = MenuGroup;
Menu.Divider = MenuDivider;

// === Collapsible List ===
function CollapsibleList({ children, defaultExpanded = false }) {
  const [expandedItems, setExpandedItems] = useState(
    defaultExpanded ? new Set(Children.map(children, (_, index) => index)) : new Set()
  );
  
  const toggleExpanded = (index) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  return (
    <div className="collapsible-list">
      {Children.map(children, (child, index) =>
        cloneElement(child, {
          isExpanded: expandedItems.has(index),
          onToggle: () => toggleExpanded(index),
          index
        })
      )}
    </div>
  );
}

function ListItem({ children, title, isExpanded, onToggle, icon }) {
  return (
    <div className="list-item">
      <div className="list-item-header" onClick={onToggle}>
        {icon && <span className="list-item-icon">{icon}</span>}
        <span className="list-item-title">{title}</span>
        <span className="list-item-toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      {isExpanded && (
        <div className="list-item-content">
          {children}
        </div>
      )}
    </div>
  );
}

CollapsibleList.Item = ListItem;

// === Demo Component ===
function CompoundBasicDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  
  return (
    <div className="compound-demo">
      <h1>Compound Components Demo</h1>
      
      <section>
        <h2>Accordion</h2>
        <BasicAccordion allowMultiple={false}>
          <BasicAccordion.Section id="section1" title="Getting Started">
            <p>This is the getting started content. Learn the basics here.</p>
            <ul>
              <li>Installation</li>
              <li>Configuration</li>
              <li>First steps</li>
            </ul>
          </BasicAccordion.Section>
          
          <BasicAccordion.Section id="section2" title="Advanced Topics">
            <p>Advanced features and configurations.</p>
            <p>Deep dive into complex scenarios and edge cases.</p>
          </BasicAccordion.Section>
          
          <BasicAccordion.Section id="section3" title="API Reference">
            <p>Complete API documentation with examples.</p>
            <code>
              {'function example() { return "Hello World"; }'}
            </code>
          </BasicAccordion.Section>
        </BasicAccordion>
      </section>
      
      <section>
        <h2>Stepper</h2>
        <Stepper currentStep={currentStep} onStepChange={setCurrentStep}>
          <Stepper.Step>
            {({ stepIndex, nextStep }) => (
              <div>
                <h3>Step {stepIndex + 1}: Personal Information</h3>
                <form>
                  <input placeholder="First Name" />
                  <input placeholder="Last Name" />
                  <input placeholder="Email" />
                </form>
              </div>
            )}
          </Stepper.Step>
          
          <Stepper.Step>
            {({ stepIndex, nextStep, prevStep }) => (
              <div>
                <h3>Step {stepIndex + 1}: Preferences</h3>
                <form>
                  <label>
                    <input type="checkbox" /> Newsletter
                  </label>
                  <label>
                    <input type="checkbox" /> SMS Updates  
                  </label>
                </form>
              </div>
            )}
          </Stepper.Step>
          
          <Stepper.Step>
            {({ stepIndex }) => (
              <div>
                <h3>Step {stepIndex + 1}: Review & Submit</h3>
                <p>Please review your information and submit.</p>
                <button>Submit</button>
              </div>
            )}
          </Stepper.Step>
        </Stepper>
      </section>
      
      <section>
        <h2>Card System</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Card variant="primary">
            <Card.Header actions={<button>Edit</button>}>
              Primary Card
            </Card.Header>
            <Card.Body>
              <p>This is a primary card with header actions.</p>
            </Card.Body>
            <Card.Footer>
              <button>Save</button>
              <button>Cancel</button>
            </Card.Footer>
          </Card>
          
          <Card variant="secondary">
            <Card.Header>Secondary Card</Card.Header>
            <Card.Body padding="compact">
              <p>Compact padding card content.</p>
            </Card.Body>
          </Card>
        </div>
      </section>
      
      <section>
        <h2>Menu System</h2>
        <Menu orientation="horizontal">
          <Menu.Group title="File">
            <Menu.Item icon="📄">New</Menu.Item>
            <Menu.Item icon="📁">Open</Menu.Item>
            <Menu.Item icon="💾">Save</Menu.Item>
            <Menu.Divider />
            <Menu.Item icon="🚪">Exit</Menu.Item>
          </Menu.Group>
          
          <Menu.Group title="Edit">
            <Menu.Item icon="↩️">Undo</Menu.Item>
            <Menu.Item icon="↪️">Redo</Menu.Item>
            <Menu.Divider />
            <Menu.Item icon="📋">Copy</Menu.Item>
            <Menu.Item icon="📄">Paste</Menu.Item>
          </Menu.Group>
        </Menu>
      </section>
      
      <section>
        <h2>Collapsible List</h2>
        <CollapsibleList>
          <CollapsibleList.Item title="Frontend Technologies" icon="🎨">
            <ul>
              <li>React</li>
              <li>Vue.js</li>
              <li>Angular</li>
              <li>Svelte</li>
            </ul>
          </CollapsibleList.Item>
          
          <CollapsibleList.Item title="Backend Technologies" icon="⚙️">
            <ul>
              <li>Node.js</li>
              <li>Python</li>
              <li>Java</li>
              <li>Go</li>
            </ul>
          </CollapsibleList.Item>
          
          <CollapsibleList.Item title="Databases" icon="🗄️">
            <ul>
              <li>MongoDB</li>
              <li>PostgreSQL</li>
              <li>Redis</li>
              <li>Elasticsearch</li>
            </ul>
          </CollapsibleList.Item>
        </CollapsibleList>
      </section>
    </div>
  );
}

export default CompoundBasicDemo;
export {
  BasicAccordion,
  AccordionSection,
  AccordionHeader,
  AccordionContent,
  Stepper,
  StepperNav,
  StepperContent,
  Step,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Menu,
  MenuItem,
  MenuGroup,
  MenuDivider,
  CollapsibleList,
  ListItem
};