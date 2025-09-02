/**
 * Content Security Policy (CSP) Helper - CSP Header Generation and Violation Handling
 * 
 * A comprehensive CSP management system including:
 * - CSP header generation with directive builders
 * - Nonce and hash generation for inline content
 * - CSP violation reporting and monitoring
 * - Policy testing and validation utilities
 * - Multiple implementation approaches from basic to enterprise-grade
 * 
 * Problem: Implement Content Security Policy to prevent XSS and other code injection attacks
 * 
 * Key Interview Points:
 * - Understanding CSP directives and their security implications
 * - Nonce vs hash-based inline script/style protection
 * - CSP violation reporting and monitoring
 * - Performance impact of strict CSP policies
 * - CSP deployment strategies and gradual rollout
 * 
 * Companies: All security-conscious companies need robust CSP implementation
 * Frequency: High - Critical for preventing XSS and injection attacks
 */

// ========================================================================================
// APPROACH 1: BASIC CSP BUILDER - Simple directive management and header generation
// ========================================================================================

/**
 * Basic CSP policy builder with common directive support
 * Mental model: Build CSP policy by configuring security directives
 * 
 * Time Complexity: O(n) where n is number of directives and sources
 * Space Complexity: O(n) for storing policy configuration
 * 
 * Interview considerations:
 * - What is Content Security Policy? (Browser security feature to prevent code injection)
 * - How does CSP prevent XSS attacks? (Controls resource loading and execution)
 * - What are the main CSP directives? (script-src, style-src, img-src, etc.)
 * - What's the difference between 'unsafe-inline' and nonce/hash? (Specificity and security)
 */
class BasicCSPBuilder {
  constructor(options = {}) {
    this.policy = {
      'default-src': [],
      'script-src': [],
      'style-src': [],
      'img-src': [],
      'font-src': [],
      'connect-src': [],
      'media-src': [],
      'object-src': [],
      'child-src': [],
      'frame-src': [],
      'worker-src': [],
      'manifest-src': [],
      'base-uri': [],
      'form-action': [],
      'upgrade-insecure-requests': false,
      'block-all-mixed-content': false
    };
    
    this.config = {
      reportOnly: options.reportOnly || false,
      reportUri: options.reportUri || null,
      enableNonces: options.enableNonces !== false,
      enableHashes: options.enableHashes !== false,
      ...options
    };
    
    // Nonce storage for current request
    this.currentNonce = null;
    this.inlineHashes = new Set();
  }
  
  /**
   * Set default source directive
   * Fallback for all other fetch directives
   */
  setDefaultSrc(...sources) {
    this.policy['default-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Set script source directive
   * Controls JavaScript execution sources
   */
  setScriptSrc(...sources) {
    this.policy['script-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Set style source directive
   * Controls CSS loading sources
   */
  setStyleSrc(...sources) {
    this.policy['style-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Set image source directive
   * Controls image loading sources
   */
  setImgSrc(...sources) {
    this.policy['img-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Set connect source directive
   * Controls AJAX, WebSocket, and fetch() connections
   */
  setConnectSrc(...sources) {
    this.policy['connect-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Set font source directive
   * Controls font loading sources
   */
  setFontSrc(...sources) {
    this.policy['font-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Set frame source directive
   * Controls iframe embedding sources
   */
  setFrameSrc(...sources) {
    this.policy['frame-src'] = this.validateSources(sources);
    return this;
  }
  
  /**
   * Enable mixed content blocking
   * Forces HTTPS for all resources on HTTPS pages
   */
  blockAllMixedContent() {
    this.policy['block-all-mixed-content'] = true;
    return this;
  }
  
  /**
   * Enable automatic HTTPS upgrades
   * Upgrades HTTP requests to HTTPS automatically
   */
  upgradeInsecureRequests() {
    this.policy['upgrade-insecure-requests'] = true;
    return this;
  }
  
  /**
   * Set report URI for violation reporting
   * Configures where CSP violations are sent
   */
  setReportUri(uri) {
    this.config.reportUri = uri;
    return this;
  }
  
  /**
   * Enable report-only mode for testing
   * CSP violations are reported but not enforced
   */
  setReportOnly(enabled = true) {
    this.config.reportOnly = enabled;
    return this;
  }
  
  /**
   * Validate CSP source values
   * Ensures sources follow CSP specification
   */
  validateSources(sources) {
    const validSources = [];
    
    sources.forEach(source => {
      if (typeof source !== 'string') {
        console.warn('CSP source must be a string:', source);
        return;
      }
      
      // Validate common CSP keywords
      const keywords = [
        "'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", 
        "'strict-dynamic'", "'unsafe-hashes'"
      ];
      
      // Check if it's a keyword, URL, or scheme
      if (keywords.includes(source) || 
          this.isValidUrl(source) || 
          this.isValidScheme(source) ||
          source.startsWith("'nonce-") ||
          source.startsWith("'sha256-") ||
          source.startsWith("'sha384-") ||
          source.startsWith("'sha512-")) {
        validSources.push(source);
      } else {
        console.warn('Invalid CSP source:', source);
      }
    });
    
    return validSources;
  }
  
  /**
   * Check if string is a valid URL for CSP
   * Validates URL format for CSP sources
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      // Check for hostname patterns like *.example.com
      const hostnamePattern = /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      return hostnamePattern.test(url);
    }
  }
  
  /**
   * Check if string is a valid scheme for CSP
   * Validates URL schemes like https:, data:, blob:
   */
  isValidScheme(scheme) {
    const validSchemes = [
      'http:', 'https:', 'data:', 'blob:', 'filesystem:', 
      'ws:', 'wss:', 'ftp:', 'mailto:'
    ];
    return validSchemes.includes(scheme);
  }
  
  /**
   * Generate secure nonce for inline content
   * Creates unpredictable value for nonce-based CSP
   */
  generateNonce() {
    // Generate cryptographically secure random nonce
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      const buffer = crypto.randomBytes(16);
      array.set(buffer);
    } else {
      // Fallback - not cryptographically secure
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...array));
    this.currentNonce = base64;
    
    return base64;
  }
  
  /**
   * Add nonce to script or style directive
   * Allows specific inline content with nonce
   */
  addNonce(directive, nonce = null) {
    if (!nonce) {
      nonce = this.generateNonce();
    }
    
    if (!this.policy[directive]) {
      this.policy[directive] = [];
    }
    
    const nonceSource = `'nonce-${nonce}'`;
    if (!this.policy[directive].includes(nonceSource)) {
      this.policy[directive].push(nonceSource);
    }
    
    return nonce;
  }
  
  /**
   * Generate hash for inline content
   * Creates SHA-256 hash for hash-based CSP
   */
  generateHash(content, algorithm = 'sha256') {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Browser environment with Web Crypto API
      return crypto.subtle.digest(algorithm.toUpperCase(), new TextEncoder().encode(content))
        .then(hashBuffer => {
          const hashArray = new Uint8Array(hashBuffer);
          const hashBase64 = btoa(String.fromCharCode(...hashArray));
          return `'${algorithm}-${hashBase64}'`;
        });
    } else if (typeof require !== 'undefined') {
      // Node.js environment
      const crypto = require('crypto');
      const hash = crypto.createHash(algorithm).update(content).digest('base64');
      return Promise.resolve(`'${algorithm}-${hash}'`);
    } else {
      return Promise.reject(new Error('Hash generation not supported'));
    }
  }
  
  /**
   * Add hash to script or style directive
   * Allows specific inline content with hash
   */
  async addHash(directive, content, algorithm = 'sha256') {
    try {
      const hashSource = await this.generateHash(content, algorithm);
      
      if (!this.policy[directive]) {
        this.policy[directive] = [];
      }
      
      if (!this.policy[directive].includes(hashSource)) {
        this.policy[directive].push(hashSource);
      }
      
      this.inlineHashes.add(hashSource);
      return hashSource;
    } catch (error) {
      console.error('Failed to generate hash:', error);
      throw error;
    }
  }
  
  /**
   * Build CSP header string
   * Converts policy configuration to CSP header format
   */
  build() {
    const directives = [];
    
    // Build each directive
    for (const [directive, sources] of Object.entries(this.policy)) {
      if (directive === 'upgrade-insecure-requests') {
        if (sources === true) {
          directives.push('upgrade-insecure-requests');
        }
      } else if (directive === 'block-all-mixed-content') {
        if (sources === true) {
          directives.push('block-all-mixed-content');
        }
      } else if (Array.isArray(sources) && sources.length > 0) {
        directives.push(`${directive} ${sources.join(' ')}`);
      }
    }
    
    // Add report-uri if configured
    if (this.config.reportUri) {
      directives.push(`report-uri ${this.config.reportUri}`);
    }
    
    return directives.join('; ');
  }
  
  /**
   * Get CSP header name based on report-only mode
   * Returns appropriate header name for enforcement vs reporting
   */
  getHeaderName() {
    return this.config.reportOnly ? 
      'Content-Security-Policy-Report-Only' : 
      'Content-Security-Policy';
  }
  
  /**
   * Get CSP as HTTP header object
   * Returns object suitable for setting HTTP headers
   */
  getHeader() {
    return {
      [this.getHeaderName()]: this.build()
    };
  }
}

// ========================================================================================
// APPROACH 2: ADVANCED CSP MANAGER - Dynamic policy management with violation tracking
// ========================================================================================

/**
 * Advanced CSP manager with dynamic policies and violation monitoring
 * Mental model: Manage CSP policies across different contexts with monitoring
 * 
 * Features:
 * - Multiple policy contexts (strict, relaxed, development)
 * - Dynamic policy adjustment based on violations
 * - Violation reporting and analysis
 * - CSP testing and gradual rollout support
 */
class AdvancedCSPManager extends BasicCSPBuilder {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Policy contexts
      enableMultipleContexts: options.enableMultipleContexts !== false,
      defaultContext: options.defaultContext || 'default',
      
      // Violation handling
      enableViolationTracking: options.enableViolationTracking !== false,
      violationThreshold: options.violationThreshold || 10,
      
      // Dynamic adjustment
      enableDynamicAdjustment: options.enableDynamicAdjustment || false,
      adjustmentCooldown: options.adjustmentCooldown || 300000, // 5 minutes
      
      // Testing features
      enableTesting: options.enableTesting || false,
      testingPercentage: options.testingPercentage || 10
    };
    
    // Policy contexts for different scenarios
    this.contexts = new Map();
    this.activeContext = this.config.defaultContext;
    
    // Violation tracking
    this.violations = [];
    this.violationStats = new Map();
    this.lastAdjustment = 0;
    
    // Initialize default contexts
    this.initializeDefaultContexts();
  }
  
  /**
   * Initialize common policy contexts
   * Sets up predefined security contexts
   */
  initializeDefaultContexts() {
    // Strict security context
    this.createContext('strict')
      .setDefaultSrc("'self'")
      .setScriptSrc("'self'")
      .setStyleSrc("'self'")
      .setImgSrc("'self'", 'data:')
      .setConnectSrc("'self'")
      .setFontSrc("'self'")
      .setFrameSrc("'none'")
      .blockAllMixedContent()
      .upgradeInsecureRequests();
    
    // Development context with more permissive policies
    this.createContext('development')
      .setDefaultSrc("'self'", "'unsafe-inline'", "'unsafe-eval'")
      .setScriptSrc("'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*', '127.0.0.1:*')
      .setStyleSrc("'self'", "'unsafe-inline'")
      .setImgSrc("'self'", 'data:', 'blob:', '*')
      .setConnectSrc("'self'", 'ws:', 'wss:', '*')
      .setFontSrc("'self'", 'data:', '*');
    
    // Production context with nonce-based inline support
    this.createContext('production')
      .setDefaultSrc("'self'")
      .setScriptSrc("'self'", "'strict-dynamic'")
      .setStyleSrc("'self'")
      .setImgSrc("'self'", 'data:', 'https:')
      .setConnectSrc("'self'", 'https:')
      .setFontSrc("'self'", 'https:')
      .blockAllMixedContent()
      .upgradeInsecureRequests();
    
    // Set default context
    this.switchContext(this.config.defaultContext);
  }
  
  /**
   * Create new policy context
   * Allows multiple CSP policies for different scenarios
   */
  createContext(name) {
    const contextBuilder = new BasicCSPBuilder(this.config);
    this.contexts.set(name, contextBuilder);
    return contextBuilder;
  }
  
  /**
   * Switch to different policy context
   * Changes active CSP policy
   */
  switchContext(contextName) {
    if (!this.contexts.has(contextName)) {
      throw new Error(`CSP context '${contextName}' not found`);
    }
    
    this.activeContext = contextName;
    const context = this.contexts.get(contextName);
    
    // Copy context policy to main policy
    this.policy = { ...context.policy };
    
    return this;
  }
  
  /**
   * Get policy for specific context
   * Retrieves CSP policy without switching active context
   */
  getContextPolicy(contextName) {
    const context = this.contexts.get(contextName);
    return context ? context.build() : null;
  }
  
  /**
   * Process CSP violation report
   * Handles incoming violation reports from browsers
   */
  processViolationReport(violationReport) {
    if (!this.config.enableViolationTracking) {
      return;
    }
    
    const violation = {
      timestamp: Date.now(),
      documentUri: violationReport['document-uri'],
      violatedDirective: violationReport['violated-directive'],
      blockedUri: violationReport['blocked-uri'],
      originalPolicy: violationReport['original-policy'],
      effectiveDirective: violationReport['effective-directive'],
      sourceFile: violationReport['source-file'],
      lineNumber: violationReport['line-number'],
      columnNumber: violationReport['column-number'],
      statusCode: violationReport['status-code'],
      userAgent: violationReport['user-agent'] || 'unknown'
    };
    
    this.violations.push(violation);
    
    // Update violation statistics
    const directiveKey = violation.effectiveDirective || violation.violatedDirective;
    const currentCount = this.violationStats.get(directiveKey) || 0;
    this.violationStats.set(directiveKey, currentCount + 1);
    
    // Trigger dynamic adjustment if enabled and threshold reached
    if (this.config.enableDynamicAdjustment && 
        currentCount >= this.config.violationThreshold &&
        Date.now() - this.lastAdjustment > this.config.adjustmentCooldown) {
      
      this.adjustPolicyForViolation(violation);
      this.lastAdjustment = Date.now();
    }
    
    // Log violation for monitoring
    console.warn('CSP Violation:', violation);
    
    return violation;
  }
  
  /**
   * Adjust policy based on common violations
   * Automatically relaxes policy for frequent violations
   */
  adjustPolicyForViolation(violation) {
    const directive = violation.effectiveDirective || violation.violatedDirective;
    const blockedUri = violation.blockedUri;
    
    console.log(`Adjusting CSP policy for directive: ${directive}, blocked URI: ${blockedUri}`);
    
    try {
      // Parse directive to get base directive name
      const baseDirective = directive.split(' ')[0];
      
      if (!this.policy[baseDirective]) {
        this.policy[baseDirective] = [];
      }
      
      // Add blocked URI as allowed source (simplified logic)
      if (blockedUri && blockedUri !== 'eval' && blockedUri !== 'inline') {
        const urlObj = new URL(blockedUri);
        const origin = `${urlObj.protocol}//${urlObj.host}`;
        
        if (!this.policy[baseDirective].includes(origin)) {
          this.policy[baseDirective].push(origin);
          console.log(`Added ${origin} to ${baseDirective} due to violations`);
        }
      }
    } catch (error) {
      console.error('Failed to adjust CSP policy:', error);
    }
  }
  
  /**
   * Get violation statistics
   * Returns analysis of CSP violations
   */
  getViolationStats(timeframe = 3600000) { // Default: 1 hour
    const since = Date.now() - timeframe;
    const recentViolations = this.violations.filter(v => v.timestamp > since);
    
    // Group by directive
    const byDirective = {};
    const byUri = {};
    const byUserAgent = {};
    
    recentViolations.forEach(violation => {
      const directive = violation.effectiveDirective || violation.violatedDirective;
      const uri = violation.blockedUri;
      const userAgent = violation.userAgent;
      
      byDirective[directive] = (byDirective[directive] || 0) + 1;
      byUri[uri] = (byUri[uri] || 0) + 1;
      byUserAgent[userAgent] = (byUserAgent[userAgent] || 0) + 1;
    });
    
    return {
      timeframe: {
        start: new Date(since).toISOString(),
        end: new Date().toISOString(),
        durationMs: timeframe
      },
      total: recentViolations.length,
      byDirective,
      byUri,
      byUserAgent,
      topViolations: this.getTopViolations(recentViolations, 10)
    };
  }
  
  /**
   * Get most frequent violations
   * Identifies problematic policy rules
   */
  getTopViolations(violations, limit = 10) {
    const violationCounts = {};
    
    violations.forEach(violation => {
      const key = `${violation.violatedDirective} -> ${violation.blockedUri}`;
      violationCounts[key] = (violationCounts[key] || 0) + 1;
    });
    
    return Object.entries(violationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([violation, count]) => ({ violation, count }));
  }
  
  /**
   * Test CSP policy against content
   * Validates if content would pass CSP policy
   */
  testPolicy(content, contentType = 'script') {
    const testResults = {
      passed: false,
      violations: [],
      suggestions: []
    };
    
    // Simple content analysis (would be more sophisticated in production)
    if (contentType === 'script') {
      // Check for inline event handlers
      if (content.includes('onclick=') || content.includes('onload=')) {
        testResults.violations.push({
          type: 'inline-event-handler',
          message: 'Inline event handlers are not allowed',
          suggestion: 'Use addEventListener() or allow unsafe-inline'
        });
      }
      
      // Check for eval usage
      if (content.includes('eval(') || content.includes('Function(')) {
        testResults.violations.push({
          type: 'eval-usage',
          message: 'eval() and Function() constructor are not allowed',
          suggestion: 'Remove eval usage or allow unsafe-eval'
        });
      }
      
      // Check for inline scripts
      if (content.includes('<script>') && !content.includes('nonce=')) {
        testResults.violations.push({
          type: 'inline-script',
          message: 'Inline scripts require nonce or hash',
          suggestion: 'Add nonce attribute or use hash-based CSP'
        });
      }
    }
    
    testResults.passed = testResults.violations.length === 0;
    return testResults;
  }
  
  /**
   * Generate CSP report endpoint handler
   * Creates middleware for processing violation reports
   */
  createReportHandler() {
    return (req, res, next) => {
      try {
        const reportData = req.body;
        
        // Handle both single report and report array
        const reports = reportData['csp-report'] ? 
          [reportData['csp-report']] : 
          (Array.isArray(reportData) ? reportData : [reportData]);
        
        reports.forEach(report => {
          this.processViolationReport(report);
        });
        
        res.status(204).send(); // No content response
        
      } catch (error) {
        console.error('CSP report processing error:', error);
        res.status(400).json({ error: 'Invalid report format' });
      }
    };
  }
  
  /**
   * Cleanup old violations
   * Prevents memory leaks in long-running applications
   */
  cleanupOldViolations(maxAge = 86400000) { // Default: 24 hours
    const cutoffTime = Date.now() - maxAge;
    const initialLength = this.violations.length;
    
    this.violations = this.violations.filter(violation => 
      violation.timestamp > cutoffTime);
    
    const removedCount = initialLength - this.violations.length;
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old CSP violations`);
    }
    
    return removedCount;
  }
}

// ========================================================================================
// APPROACH 3: ENTERPRISE CSP SYSTEM - Production-ready with compliance and automation
// ========================================================================================

/**
 * Enterprise CSP system with advanced features
 * Mental model: Complete CSP lifecycle management for large organizations
 * 
 * Features:
 * - Policy versioning and rollback capability
 * - A/B testing for CSP policies
 * - Compliance reporting and audit trails
 * - Integration with CI/CD pipelines
 * - Automated policy optimization
 */
class EnterpriseCSPSystem extends AdvancedCSPManager {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Policy versioning
      enableVersioning: options.enableVersioning !== false,
      maxVersionHistory: options.maxVersionHistory || 10,
      
      // A/B testing
      enableABTesting: options.enableABTesting || false,
      testTrafficPercentage: options.testTrafficPercentage || 5,
      
      // Compliance
      complianceStandards: options.complianceStandards || [],
      auditRetentionPeriod: options.auditRetentionPeriod || 7776000000, // 90 days
      
      // Automation
      enableAutoOptimization: options.enableAutoOptimization || false,
      optimizationThreshold: options.optimizationThreshold || 100,
      
      // Integration
      cicdWebhook: options.cicdWebhook || null,
      slackWebhook: options.slackWebhook || null
    };
    
    // Enterprise features
    this.policyVersions = [];
    this.currentVersion = '1.0.0';
    this.abTestGroups = new Map();
    this.auditTrail = [];
    this.complianceReports = [];
    
    // Initialize enterprise features
    this.initializeEnterpriseFeatures();
  }
  
  /**
   * Initialize enterprise features
   * Sets up versioning, monitoring, and automation
   */
  initializeEnterpriseFeatures() {
    // Create initial policy version
    this.createPolicyVersion('1.0.0', 'Initial CSP policy');
    
    // Set up automated cleanup
    setInterval(() => {
      this.performMaintenanceTasks();
    }, 3600000); // 1 hour
    
    // Set up compliance monitoring
    if (this.config.complianceStandards.length > 0) {
      setInterval(() => {
        this.generateComplianceReport();
      }, 86400000); // 24 hours
    }
    
    console.log('Enterprise CSP system initialized');
  }
  
  /**
   * Create new policy version
   * Implements versioning for policy changes
   */
  createPolicyVersion(version, description) {
    const policyVersion = {
      version,
      description,
      policy: JSON.parse(JSON.stringify(this.policy)), // Deep copy
      timestamp: Date.now(),
      createdBy: 'system', // Would be actual user in production
      contexts: new Map()
    };
    
    // Copy all contexts
    for (const [name, context] of this.contexts.entries()) {
      policyVersion.contexts.set(name, {
        policy: JSON.parse(JSON.stringify(context.policy))
      });
    }
    
    this.policyVersions.push(policyVersion);
    this.currentVersion = version;
    
    // Maintain version history limit
    if (this.policyVersions.length > this.config.maxVersionHistory) {
      this.policyVersions.shift();
    }
    
    // Log to audit trail
    this.addAuditEntry('POLICY_VERSION_CREATED', {
      version,
      description
    });
    
    return policyVersion;
  }
  
  /**
   * Rollback to previous policy version
   * Provides quick recovery from problematic policies
   */
  rollbackToVersion(version) {
    const targetVersion = this.policyVersions.find(v => v.version === version);
    if (!targetVersion) {
      throw new Error(`Policy version ${version} not found`);
    }
    
    // Restore policy
    this.policy = JSON.parse(JSON.stringify(targetVersion.policy));
    
    // Restore contexts
    this.contexts.clear();
    for (const [name, contextData] of targetVersion.contexts.entries()) {
      const context = new BasicCSPBuilder(this.config);
      context.policy = JSON.parse(JSON.stringify(contextData.policy));
      this.contexts.set(name, context);
    }
    
    // Create new version for the rollback
    this.createPolicyVersion(
      `${this.currentVersion}-rollback`, 
      `Rollback to version ${version}`
    );
    
    // Log rollback
    this.addAuditEntry('POLICY_ROLLBACK', {
      fromVersion: this.currentVersion,
      toVersion: version
    });
    
    console.log(`CSP policy rolled back to version ${version}`);
    
    return targetVersion;
  }
  
  /**
   * Set up A/B testing for CSP policies
   * Allows testing different policies on subset of traffic
   */
  setupABTest(name, testPolicy, trafficPercentage = null) {
    const percentage = trafficPercentage || this.config.testTrafficPercentage;
    
    const abTest = {
      name,
      testPolicy,
      controlPolicy: JSON.parse(JSON.stringify(this.policy)),
      trafficPercentage: percentage,
      startTime: Date.now(),
      controlViolations: 0,
      testViolations: 0,
      controlRequests: 0,
      testRequests: 0,
      active: true
    };
    
    this.abTestGroups.set(name, abTest);
    
    this.addAuditEntry('AB_TEST_STARTED', {
      testName: name,
      trafficPercentage: percentage
    });
    
    console.log(`A/B test '${name}' started with ${percentage}% traffic`);
    
    return abTest;
  }
  
  /**
   * Determine which policy to serve based on A/B test
   * Routes traffic between control and test policies
   */
  getPolicyForRequest(request) {
    // Check for active A/B tests
    for (const [testName, abTest] of this.abTestGroups.entries()) {
      if (!abTest.active) continue;
      
      // Simple hash-based traffic splitting
      const requestHash = this.hashRequest(request);
      const bucket = requestHash % 100;
      
      if (bucket < abTest.trafficPercentage) {
        abTest.testRequests++;
        return {
          policy: abTest.testPolicy,
          testGroup: testName,
          variant: 'test'
        };
      } else {
        abTest.controlRequests++;
        return {
          policy: abTest.controlPolicy,
          testGroup: testName,
          variant: 'control'
        };
      }
    }
    
    // Default policy
    return {
      policy: this.policy,
      testGroup: null,
      variant: 'default'
    };
  }
  
  /**
   * Hash request for consistent A/B test bucketing
   * Ensures same user gets same test variant
   */
  hashRequest(request) {
    const identifier = request.ip || request.sessionId || request.userId || 'anonymous';
    let hash = 0;
    
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }
  
  /**
   * Process violation with A/B test tracking
   * Enhanced violation processing with test group tracking
   */
  processViolationReport(violationReport, testGroup = null, variant = 'default') {
    const violation = super.processViolationReport(violationReport);
    
    // Track A/B test violations
    if (testGroup && this.abTestGroups.has(testGroup)) {
      const abTest = this.abTestGroups.get(testGroup);
      if (variant === 'test') {
        abTest.testViolations++;
      } else {
        abTest.controlViolations++;
      }
    }
    
    return violation;
  }
  
  /**
   * Analyze A/B test results
   * Provides statistical analysis of test vs control
   */
  analyzeABTest(testName) {
    const abTest = this.abTestGroups.get(testName);
    if (!abTest) {
      throw new Error(`A/B test '${testName}' not found`);
    }
    
    const controlViolationRate = abTest.controlRequests > 0 ? 
      abTest.controlViolations / abTest.controlRequests : 0;
    
    const testViolationRate = abTest.testRequests > 0 ? 
      abTest.testViolations / abTest.testRequests : 0;
    
    const improvement = controlViolationRate > 0 ? 
      ((controlViolationRate - testViolationRate) / controlViolationRate) * 100 : 0;
    
    return {
      testName,
      duration: Date.now() - abTest.startTime,
      control: {
        requests: abTest.controlRequests,
        violations: abTest.controlViolations,
        violationRate: controlViolationRate
      },
      test: {
        requests: abTest.testRequests,
        violations: abTest.testViolations,
        violationRate: testViolationRate
      },
      improvement: improvement,
      significance: this.calculateSignificance(abTest),
      recommendation: this.getTestRecommendation(improvement, abTest)
    };
  }
  
  /**
   * Calculate statistical significance (simplified)
   * Determines if test results are statistically significant
   */
  calculateSignificance(abTest) {
    // Simplified significance calculation
    // In production, use proper statistical tests
    const totalRequests = abTest.controlRequests + abTest.testRequests;
    const minSampleSize = 1000;
    
    if (totalRequests < minSampleSize) {
      return 'insufficient_data';
    }
    
    const totalViolations = abTest.controlViolations + abTest.testViolations;
    if (totalViolations < 10) {
      return 'low_violation_count';
    }
    
    return 'significant'; // Simplified determination
  }
  
  /**
   * Get recommendation based on test results
   * Provides actionable insights from A/B test
   */
  getTestRecommendation(improvement, abTest) {
    if (improvement > 20) {
      return 'implement_test_policy';
    } else if (improvement > 5) {
      return 'continue_testing';
    } else if (improvement < -10) {
      return 'revert_to_control';
    } else {
      return 'no_significant_difference';
    }
  }
  
  /**
   * Generate compliance report
   * Creates reports for security compliance standards
   */
  generateComplianceReport() {
    const report = {
      id: `compliance_${Date.now()}`,
      timestamp: Date.now(),
      period: {
        start: Date.now() - 86400000, // 24 hours
        end: Date.now()
      },
      standards: this.config.complianceStandards,
      findings: [],
      score: 0,
      recommendations: []
    };
    
    // Check compliance for each standard
    this.config.complianceStandards.forEach(standard => {
      const findings = this.checkCompliance(standard);
      report.findings.push(...findings);
    });
    
    // Calculate compliance score
    const totalChecks = report.findings.length;
    const passedChecks = report.findings.filter(f => f.status === 'pass').length;
    report.score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;
    
    // Generate recommendations
    const failedChecks = report.findings.filter(f => f.status === 'fail');
    report.recommendations = failedChecks.map(check => ({
      priority: check.severity,
      description: check.recommendation,
      standard: check.standard
    }));
    
    this.complianceReports.push(report);
    
    // Cleanup old reports
    const cutoffTime = Date.now() - this.config.auditRetentionPeriod;
    this.complianceReports = this.complianceReports.filter(r => r.timestamp > cutoffTime);
    
    console.log(`Compliance report generated: ${report.score.toFixed(1)}% compliance`);
    
    return report;
  }
  
  /**
   * Check compliance against specific standard
   * Validates CSP policy against compliance requirements
   */
  checkCompliance(standard) {
    const findings = [];
    
    switch (standard.toLowerCase()) {
      case 'owasp':
        findings.push(...this.checkOWASPCompliance());
        break;
      case 'pci-dss':
        findings.push(...this.checkPCIDSSCompliance());
        break;
      case 'nist':
        findings.push(...this.checkNISTCompliance());
        break;
      default:
        findings.push({
          standard,
          check: 'unknown_standard',
          status: 'skip',
          message: `Unknown compliance standard: ${standard}`
        });
    }
    
    return findings;
  }
  
  /**
   * Check OWASP compliance
   * Validates against OWASP security guidelines
   */
  checkOWASPCompliance() {
    const findings = [];
    
    // Check for default-src directive
    if (!this.policy['default-src'] || this.policy['default-src'].length === 0) {
      findings.push({
        standard: 'OWASP',
        check: 'default_src_missing',
        status: 'fail',
        severity: 'high',
        message: 'default-src directive is missing',
        recommendation: 'Add default-src directive to control resource loading'
      });
    }
    
    // Check for unsafe-inline in script-src
    if (this.policy['script-src'] && this.policy['script-src'].includes("'unsafe-inline'")) {
      findings.push({
        standard: 'OWASP',
        check: 'unsafe_inline_scripts',
        status: 'fail',
        severity: 'high',
        message: 'unsafe-inline allowed in script-src',
        recommendation: 'Use nonce or hash-based CSP instead of unsafe-inline'
      });
    } else {
      findings.push({
        standard: 'OWASP',
        check: 'unsafe_inline_scripts',
        status: 'pass',
        message: 'No unsafe-inline in script-src'
      });
    }
    
    // Check for mixed content blocking
    if (!this.policy['block-all-mixed-content']) {
      findings.push({
        standard: 'OWASP',
        check: 'mixed_content_blocking',
        status: 'warning',
        severity: 'medium',
        message: 'Mixed content blocking not enabled',
        recommendation: 'Enable block-all-mixed-content directive'
      });
    }
    
    return findings;
  }
  
  /**
   * Check PCI DSS compliance
   * Validates against payment card industry standards
   */
  checkPCIDSSCompliance() {
    const findings = [];
    
    // PCI DSS requires strong CSP policies
    if (!this.policy['upgrade-insecure-requests']) {
      findings.push({
        standard: 'PCI DSS',
        check: 'insecure_request_upgrade',
        status: 'fail',
        severity: 'high',
        message: 'upgrade-insecure-requests not enabled',
        recommendation: 'Enable upgrade-insecure-requests for PCI DSS compliance'
      });
    }
    
    return findings;
  }
  
  /**
   * Check NIST compliance
   * Validates against NIST cybersecurity framework
   */
  checkNISTCompliance() {
    const findings = [];
    
    // NIST requires comprehensive security controls
    if (!this.config.reportUri) {
      findings.push({
        standard: 'NIST',
        check: 'violation_reporting',
        status: 'warning',
        severity: 'medium',
        message: 'CSP violation reporting not configured',
        recommendation: 'Configure report-uri for security monitoring'
      });
    }
    
    return findings;
  }
  
  /**
   * Add entry to audit trail
   * Maintains detailed audit log for compliance
   */
  addAuditEntry(action, details) {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      details,
      version: this.currentVersion,
      user: 'system' // Would be actual user in production
    };
    
    this.auditTrail.push(auditEntry);
    
    // Cleanup old audit entries
    const cutoffTime = Date.now() - this.config.auditRetentionPeriod;
    this.auditTrail = this.auditTrail.filter(entry => entry.timestamp > cutoffTime);
  }
  
  /**
   * Perform regular maintenance tasks
   * Keeps system running efficiently
   */
  performMaintenanceTasks() {
    // Cleanup old violations
    const cleanedViolations = this.cleanupOldViolations();
    
    // Cleanup old audit entries
    const auditCutoff = Date.now() - this.config.auditRetentionPeriod;
    const initialAuditSize = this.auditTrail.length;
    this.auditTrail = this.auditTrail.filter(entry => entry.timestamp > auditCutoff);
    const cleanedAuditEntries = initialAuditSize - this.auditTrail.length;
    
    // Cleanup old compliance reports
    const complianceCutoff = Date.now() - this.config.auditRetentionPeriod;
    const initialComplianceSize = this.complianceReports.length;
    this.complianceReports = this.complianceReports.filter(report => 
      report.timestamp > complianceCutoff);
    const cleanedComplianceReports = initialComplianceSize - this.complianceReports.length;
    
    console.log(`CSP maintenance completed: ` +
                `${cleanedViolations} violations, ` +
                `${cleanedAuditEntries} audit entries, ` +
                `${cleanedComplianceReports} compliance reports cleaned`);
  }
  
  /**
   * Export configuration for backup/deployment
   * Creates portable configuration for CI/CD integration
   */
  exportConfiguration() {
    return {
      version: this.currentVersion,
      timestamp: Date.now(),
      policy: this.policy,
      contexts: Object.fromEntries(
        Array.from(this.contexts.entries()).map(([name, context]) => [
          name, context.policy
        ])
      ),
      config: this.config,
      abTests: Object.fromEntries(
        Array.from(this.abTestGroups.entries()).map(([name, test]) => [
          name, {
            name: test.name,
            testPolicy: test.testPolicy,
            trafficPercentage: test.trafficPercentage,
            active: test.active
          }
        ])
      )
    };
  }
  
  /**
   * Import configuration from backup/deployment
   * Restores system from exported configuration
   */
  importConfiguration(configData) {
    try {
      this.currentVersion = configData.version;
      this.policy = configData.policy;
      
      // Restore contexts
      this.contexts.clear();
      for (const [name, policy] of Object.entries(configData.contexts)) {
        const context = new BasicCSPBuilder(this.config);
        context.policy = policy;
        this.contexts.set(name, context);
      }
      
      // Restore A/B tests
      this.abTestGroups.clear();
      for (const [name, testConfig] of Object.entries(configData.abTests || {})) {
        this.abTestGroups.set(name, {
          ...testConfig,
          startTime: Date.now(),
          controlViolations: 0,
          testViolations: 0,
          controlRequests: 0,
          testRequests: 0
        });
      }
      
      this.addAuditEntry('CONFIGURATION_IMPORTED', {
        version: configData.version,
        timestamp: configData.timestamp
      });
      
      console.log(`CSP configuration imported: version ${configData.version}`);
      
    } catch (error) {
      console.error('Failed to import CSP configuration:', error);
      throw error;
    }
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic CSP builder
console.log('=== BASIC CSP BUILDER EXAMPLE ===');

const basicCSP = new BasicCSPBuilder()
  .setDefaultSrc("'self'")
  .setScriptSrc("'self'", "'unsafe-inline'")
  .setStyleSrc("'self'", 'https://fonts.googleapis.com')
  .setImgSrc("'self'", 'data:', 'https:')
  .setConnectSrc("'self'", 'wss:')
  .blockAllMixedContent()
  .upgradeInsecureRequests()
  .setReportUri('/csp-report');

console.log('Basic CSP policy:', basicCSP.build());
console.log('CSP header:', basicCSP.getHeader());

// Generate nonce for inline script
const nonce = basicCSP.generateNonce();
console.log('Generated nonce:', nonce);

// Example 2: Advanced CSP manager with contexts
console.log('\n=== ADVANCED CSP MANAGER EXAMPLE ===');

const advancedCSP = new AdvancedCSPManager({
  enableViolationTracking: true,
  violationThreshold: 5
});

// Switch to production context
advancedCSP.switchContext('production');
console.log('Production CSP:', advancedCSP.build());

// Simulate violation report
const violationReport = {
  'document-uri': 'https://example.com/page',
  'violated-directive': 'script-src',
  'blocked-uri': 'https://evil.com/malicious.js',
  'original-policy': advancedCSP.build()
};

advancedCSP.processViolationReport(violationReport);
console.log('Violation stats:', advancedCSP.getViolationStats());

// Example 3: Enterprise CSP system
console.log('\n=== ENTERPRISE CSP SYSTEM EXAMPLE ===');

const enterpriseCSP = new EnterpriseCSPSystem({
  enableVersioning: true,
  enableABTesting: true,
  complianceStandards: ['OWASP', 'PCI-DSS']
});

// Create new policy version
enterpriseCSP.createPolicyVersion('1.1.0', 'Added stricter script-src policy');

// Set up A/B test
const testPolicy = { ...enterpriseCSP.policy };
testPolicy['script-src'] = ["'self'", "'strict-dynamic'"];

enterpriseCSP.setupABTest('strict-dynamic-test', testPolicy, 10);

// Simulate request routing
const mockRequest = { ip: '192.168.1.100', userId: 'user123' };
const policyForRequest = enterpriseCSP.getPolicyForRequest(mockRequest);
console.log('Policy variant for request:', policyForRequest.variant);

// Generate compliance report
setTimeout(() => {
  const complianceReport = enterpriseCSP.generateComplianceReport();
  console.log('Compliance score:', complianceReport.score.toFixed(1) + '%');
}, 1000);

// Export for use in other modules
module.exports = {
  BasicCSPBuilder,
  AdvancedCSPManager,
  EnterpriseCSPSystem
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. CSP Fundamentals:
   - What is Content Security Policy and how does it prevent XSS?
   - Different CSP directives and their purposes
   - CSP evaluation algorithm and source matching
   - Difference between CSP and other security headers

2. CSP Implementation Strategies:
   - Nonce-based vs hash-based inline content protection
   - strict-dynamic and its security benefits
   - Report-only mode for gradual CSP deployment
   - CSP for single-page applications vs traditional web apps

3. CSP Directives Deep Dive:
   - script-src and style-src security implications
   - img-src and connect-src for resource loading
   - frame-src and object-src for embedding content
   - base-uri and form-action for navigation security

4. Advanced CSP Features:
   - CSP violation reporting and monitoring
   - CSP nonce rotation and management
   - CSP in service worker and web worker contexts
   - CSP inheritance and policy combination

5. Production Considerations:
   - Performance impact of CSP evaluation
   - CSP bypass techniques and prevention
   - CSP maintenance and policy evolution
   - CSP testing and validation strategies

6. Integration and Tooling:
   - CSP integration with build systems
   - CSP analysis and debugging tools
   - CSP policy generators and validators
   - CSP monitoring and alerting systems

Common Follow-up Questions:
- How do you implement CSP for a complex single-page application?
- What are the trade-offs between different CSP deployment strategies?
- How do you handle CSP violations in production?
- What's your approach to CSP policy maintenance and updates?
- How do you implement CSP nonce generation and distribution?
- What are the performance implications of different CSP configurations?
- How do you test CSP policies before deployment?
- What monitoring and alerting would you implement for CSP violations?
- How do you handle CSP for third-party integrations?
- What are the compliance requirements for CSP in different industries?
*/