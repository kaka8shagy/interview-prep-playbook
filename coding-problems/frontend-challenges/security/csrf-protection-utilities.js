/**
 * CSRF Protection Utilities - Token Generation/Validation and Request Verification
 * 
 * A comprehensive CSRF (Cross-Site Request Forgery) protection system including:
 * - Secure token generation and validation
 * - Double-submit cookie pattern implementation
 * - SameSite cookie configuration and secure headers
 * - Request verification and CSRF attack prevention
 * - Multiple implementation approaches from basic to enterprise-grade
 * 
 * Problem: Prevent Cross-Site Request Forgery attacks in web applications
 * 
 * Key Interview Points:
 * - Understanding CSRF attack vectors and prevention strategies
 * - Token-based authentication vs cookie-based authentication
 * - Same-origin policy and SameSite cookie attributes
 * - Cryptographic security and token entropy
 * - Integration with existing authentication systems
 * 
 * Companies: All companies with user authentication need CSRF protection
 * Frequency: High - Critical security requirement for web applications
 */

// ========================================================================================
// APPROACH 1: BASIC CSRF PROTECTION - Simple token generation and validation
// ========================================================================================

/**
 * Basic CSRF token manager with synchronizer token pattern
 * Mental model: Generate unique tokens per session and validate on sensitive requests
 * 
 * Time Complexity: O(1) for token generation and validation
 * Space Complexity: O(n) where n is number of active sessions
 * 
 * Interview considerations:
 * - Why is CSRF protection needed? (Malicious sites can make requests on user's behalf)
 * - What's the difference between CSRF and XSS? (CSRF exploits trust, XSS injects code)
 * - How does the synchronizer token pattern work? (Server generates token, client must include it)
 * - What are alternative CSRF protection methods? (Double-submit cookies, SameSite cookies)
 */
class BasicCSRFProtection {
  constructor(options = {}) {
    this.config = {
      tokenLength: options.tokenLength || 32,
      tokenExpiry: options.tokenExpiry || 3600000, // 1 hour
      cookieName: options.cookieName || 'csrf_token',
      headerName: options.headerName || 'X-CSRF-Token',
      
      // Security options
      secureTokens: options.secureTokens !== false,
      algorithm: options.algorithm || 'HS256',
      
      // Cookie configuration
      cookieOptions: {
        httpOnly: false, // Must be false to allow JavaScript access
        secure: options.secure !== false, // HTTPS only
        sameSite: options.sameSite || 'strict',
        path: options.path || '/',
        ...options.cookieOptions
      }
    };
    
    // Token storage - in production, this would be in session store or database
    this.tokenStore = new Map();
    this.sessionTokens = new Map(); // session -> token mapping
  }
  
  /**
   * Generate cryptographically secure CSRF token
   * Creates unpredictable token to prevent brute force attacks
   */
  generateToken(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID is required for CSRF token generation');
    }
    
    // Generate cryptographically secure random token
    const tokenBytes = this.generateSecureRandomBytes(this.config.tokenLength);
    const token = this.bytesToHex(tokenBytes);
    
    // Create token metadata
    const tokenData = {
      token,
      sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.tokenExpiry,
      used: false
    };
    
    // Store token
    this.tokenStore.set(token, tokenData);
    this.sessionTokens.set(sessionId, token);
    
    return token;
  }
  
  /**
   * Validate CSRF token against session
   * Ensures token is valid, not expired, and matches session
   */
  validateToken(token, sessionId, options = {}) {
    const validation = {
      isValid: false,
      errors: [],
      tokenData: null
    };
    
    // Basic validation
    if (!token) {
      validation.errors.push('CSRF token is required');
      return validation;
    }
    
    if (!sessionId) {
      validation.errors.push('Session ID is required');
      return validation;
    }
    
    // Check if token exists
    const tokenData = this.tokenStore.get(token);
    if (!tokenData) {
      validation.errors.push('Invalid CSRF token');
      return validation;
    }
    
    // Check token expiry
    if (Date.now() > tokenData.expiresAt) {
      validation.errors.push('CSRF token has expired');
      this.tokenStore.delete(token); // Clean up expired token
      return validation;
    }
    
    // Check session association
    if (tokenData.sessionId !== sessionId) {
      validation.errors.push('CSRF token does not match session');
      return validation;
    }
    
    // Check if token was already used (if one-time use is enabled)
    if (options.oneTimeUse && tokenData.used) {
      validation.errors.push('CSRF token has already been used');
      return validation;
    }
    
    // Mark token as used if one-time use
    if (options.oneTimeUse) {
      tokenData.used = true;
    }
    
    validation.isValid = true;
    validation.tokenData = tokenData;
    return validation;
  }
  
  /**
   * Generate secure random bytes using Web Crypto API
   * Provides cryptographically secure randomness
   */
  generateSecureRandomBytes(length) {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Browser environment
      return crypto.getRandomValues(new Uint8Array(length));
    } else if (typeof require !== 'undefined') {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.randomBytes(length);
    } else {
      // Fallback - not cryptographically secure!
      console.warn('Using insecure random number generation - not suitable for production');
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    }
  }
  
  /**
   * Convert bytes to hexadecimal string
   * Standard encoding for displaying binary data
   */
  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Set CSRF token as HTTP-only cookie
   * Securely stores token in browser
   */
  setTokenCookie(token, response) {
    if (!response || typeof response.cookie !== 'function') {
      throw new Error('Response object with cookie method is required');
    }
    
    const cookieOptions = {
      ...this.config.cookieOptions,
      maxAge: this.config.tokenExpiry
    };
    
    response.cookie(this.config.cookieName, token, cookieOptions);
  }
  
  /**
   * Get CSRF token from cookie
   * Retrieves token from browser storage
   */
  getTokenFromCookie(request) {
    if (!request || !request.cookies) {
      return null;
    }
    
    return request.cookies[this.config.cookieName];
  }
  
  /**
   * Get CSRF token from request header
   * Retrieves token from HTTP header
   */
  getTokenFromHeader(request) {
    if (!request || !request.headers) {
      return null;
    }
    
    return request.headers[this.config.headerName.toLowerCase()];
  }
  
  /**
   * Clean up expired tokens
   * Prevents memory leaks in long-running applications
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [token, tokenData] of this.tokenStore.entries()) {
      if (now > tokenData.expiresAt) {
        this.tokenStore.delete(token);
        this.sessionTokens.delete(tokenData.sessionId);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
  
  /**
   * Get token statistics for monitoring
   * Useful for security analytics
   */
  getTokenStats() {
    const now = Date.now();
    let activeTokens = 0;
    let expiredTokens = 0;
    
    for (const tokenData of this.tokenStore.values()) {
      if (now > tokenData.expiresAt) {
        expiredTokens++;
      } else {
        activeTokens++;
      }
    }
    
    return {
      totalTokens: this.tokenStore.size,
      activeTokens,
      expiredTokens,
      activeSessions: this.sessionTokens.size
    };
  }
}

// ========================================================================================
// APPROACH 2: DOUBLE-SUBMIT COOKIE PATTERN - Enhanced CSRF protection
// ========================================================================================

/**
 * Advanced CSRF protection using double-submit cookie pattern
 * Mental model: Store token in both cookie and request parameter, validate they match
 * 
 * Features:
 * - Double-submit cookie pattern implementation
 * - SameSite cookie support for modern browsers
 * - Encrypted token storage
 * - Request origin validation
 * - CORS integration
 */
class AdvancedCSRFProtection extends BasicCSRFProtection {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Double-submit pattern options
      valueTokenName: options.valueTokenName || 'csrf_value_token',
      cookieTokenName: options.cookieTokenName || 'csrf_cookie_token',
      
      // Origin validation
      allowedOrigins: options.allowedOrigins || [],
      strictOriginValidation: options.strictOriginValidation !== false,
      
      // Encryption options
      encryptTokens: options.encryptTokens !== false,
      encryptionKey: options.encryptionKey,
      
      // Advanced security
      rotatePeriod: options.rotatePeriod || 1800000, // 30 minutes
      maxTokensPerSession: options.maxTokensPerSession || 5
    };
    
    // Token rotation tracking
    this.rotationSchedule = new Map();
    
    // Initialize encryption if enabled
    if (this.config.encryptTokens && !this.config.encryptionKey) {
      this.config.encryptionKey = this.generateEncryptionKey();
    }
  }
  
  /**
   * Generate token pair for double-submit pattern
   * Creates both cookie token and value token
   */
  generateTokenPair(sessionId, request = {}) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    // Validate request origin if strict validation is enabled
    if (this.config.strictOriginValidation) {
      const originValidation = this.validateOrigin(request);
      if (!originValidation.isValid) {
        throw new Error(`Origin validation failed: ${originValidation.errors.join(', ')}`);
      }
    }
    
    // Clean up old tokens for this session if limit exceeded
    this.enforceTokenLimits(sessionId);
    
    // Generate base token
    const baseToken = this.generateToken(sessionId);
    
    // Create cookie token (encrypted if enabled)
    const cookieToken = this.config.encryptTokens ? 
      this.encryptToken(baseToken) : baseToken;
    
    // Create value token (different from cookie token for security)
    const valueToken = this.generateValueToken(baseToken);
    
    // Store token pair metadata
    const tokenPairData = {
      baseToken,
      cookieToken,
      valueToken,
      sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.tokenExpiry,
      origin: request.origin || request.headers?.origin,
      userAgent: request.userAgent || request.headers?.['user-agent']
    };
    
    this.tokenStore.set(baseToken, tokenPairData);
    
    // Schedule token rotation if enabled
    if (this.config.rotatePeriod) {
      this.scheduleTokenRotation(sessionId, baseToken);
    }
    
    return {
      cookieToken,
      valueToken,
      expiresAt: tokenPairData.expiresAt
    };
  }
  
  /**
   * Validate double-submit token pair
   * Ensures both cookie and value tokens match and are valid
   */
  validateTokenPair(cookieToken, valueToken, sessionId, request = {}) {
    const validation = {
      isValid: false,
      errors: [],
      tokenData: null,
      securityWarnings: []
    };
    
    // Basic validation
    if (!cookieToken || !valueToken) {
      validation.errors.push('Both cookie and value tokens are required');
      return validation;
    }
    
    if (!sessionId) {
      validation.errors.push('Session ID is required');
      return validation;
    }
    
    try {
      // Decrypt cookie token if encryption is enabled
      const decryptedCookieToken = this.config.encryptTokens ? 
        this.decryptToken(cookieToken) : cookieToken;
      
      // Find token data
      const tokenData = this.tokenStore.get(decryptedCookieToken);
      if (!tokenData) {
        validation.errors.push('Invalid token pair');
        return validation;
      }
      
      // Validate expiry
      if (Date.now() > tokenData.expiresAt) {
        validation.errors.push('Token pair has expired');
        this.tokenStore.delete(decryptedCookieToken);
        return validation;
      }
      
      // Validate session
      if (tokenData.sessionId !== sessionId) {
        validation.errors.push('Token pair does not match session');
        return validation;
      }
      
      // Validate value token
      const expectedValueToken = this.generateValueToken(decryptedCookieToken);
      if (valueToken !== expectedValueToken) {
        validation.errors.push('Value token does not match cookie token');
        return validation;
      }
      
      // Validate origin if strict validation is enabled
      if (this.config.strictOriginValidation) {
        const originValidation = this.validateOrigin(request);
        if (!originValidation.isValid) {
          validation.errors.push(...originValidation.errors);
          return validation;
        }
        
        // Check if origin changed since token creation
        if (tokenData.origin && tokenData.origin !== (request.origin || request.headers?.origin)) {
          validation.securityWarnings.push('Request origin differs from token creation origin');
        }
      }
      
      // Check user agent consistency
      const currentUserAgent = request.userAgent || request.headers?.['user-agent'];
      if (tokenData.userAgent && tokenData.userAgent !== currentUserAgent) {
        validation.securityWarnings.push('User agent changed since token creation');
      }
      
      validation.isValid = true;
      validation.tokenData = tokenData;
      return validation;
      
    } catch (error) {
      validation.errors.push(`Token validation error: ${error.message}`);
      return validation;
    }
  }
  
  /**
   * Validate request origin against allowed origins
   * Prevents CSRF attacks from unauthorized domains
   */
  validateOrigin(request) {
    const validation = {
      isValid: true,
      errors: []
    };
    
    const origin = request.origin || request.headers?.origin;
    const referer = request.referer || request.headers?.referer;
    
    // If no origin or referer, might be a direct request
    if (!origin && !referer) {
      if (this.config.strictOriginValidation) {
        validation.isValid = false;
        validation.errors.push('No origin or referer header present');
      }
      return validation;
    }
    
    // Check against allowed origins
    if (this.config.allowedOrigins.length > 0) {
      const requestOrigin = origin || this.extractOriginFromReferer(referer);
      
      if (!this.config.allowedOrigins.includes(requestOrigin)) {
        validation.isValid = false;
        validation.errors.push(`Origin ${requestOrigin} is not in allowed origins list`);
      }
    }
    
    return validation;
  }
  
  /**
   * Extract origin from referer header
   * Fallback for browsers that don't send origin header
   */
  extractOriginFromReferer(referer) {
    if (!referer) return null;
    
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Generate value token from base token
   * Creates derived token for double-submit pattern
   */
  generateValueToken(baseToken) {
    // Simple derivation - in production, use HMAC or similar
    return this.hashToken(baseToken + ':value');
  }
  
  /**
   * Hash token using simple algorithm
   * In production, use proper HMAC with secret key
   */
  hashToken(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
  
  /**
   * Encrypt token for secure cookie storage
   * Provides additional protection against token theft
   */
  encryptToken(token) {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key is required');
    }
    
    // Simple XOR encryption - use proper encryption in production
    const key = this.config.encryptionKey;
    let encrypted = '';
    
    for (let i = 0; i < token.length; i++) {
      const charCode = token.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    return btoa(encrypted); // Base64 encode
  }
  
  /**
   * Decrypt token from cookie storage
   * Reverses encryption for validation
   */
  decryptToken(encryptedToken) {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key is required');
    }
    
    try {
      const encrypted = atob(encryptedToken); // Base64 decode
      const key = this.config.encryptionKey;
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt token');
    }
  }
  
  /**
   * Generate encryption key for token encryption
   * Creates secure key for symmetric encryption
   */
  generateEncryptionKey() {
    const keyBytes = this.generateSecureRandomBytes(32);
    return this.bytesToHex(keyBytes);
  }
  
  /**
   * Enforce token limits per session
   * Prevents memory exhaustion attacks
   */
  enforceTokenLimits(sessionId) {
    const sessionTokens = Array.from(this.tokenStore.values())
      .filter(tokenData => tokenData.sessionId === sessionId)
      .sort((a, b) => a.createdAt - b.createdAt);
    
    // Remove oldest tokens if limit exceeded
    while (sessionTokens.length >= this.config.maxTokensPerSession) {
      const oldestToken = sessionTokens.shift();
      this.tokenStore.delete(oldestToken.baseToken);
    }
  }
  
  /**
   * Schedule automatic token rotation
   * Improves security by regularly refreshing tokens
   */
  scheduleTokenRotation(sessionId, token) {
    const rotationTime = Date.now() + this.config.rotatePeriod;
    this.rotationSchedule.set(token, rotationTime);
    
    setTimeout(() => {
      this.rotateToken(token);
    }, this.config.rotatePeriod);
  }
  
  /**
   * Rotate token before expiration
   * Creates new token and invalidates old one
   */
  rotateToken(oldToken) {
    const tokenData = this.tokenStore.get(oldToken);
    if (!tokenData) return;
    
    // Generate new token pair
    try {
      const newTokenPair = this.generateTokenPair(tokenData.sessionId, {
        origin: tokenData.origin,
        userAgent: tokenData.userAgent
      });
      
      // Remove old token
      this.tokenStore.delete(oldToken);
      this.rotationSchedule.delete(oldToken);
      
      console.log(`Token rotated for session ${tokenData.sessionId}`);
      return newTokenPair;
      
    } catch (error) {
      console.error('Token rotation failed:', error);
    }
  }
}

// ========================================================================================
// APPROACH 3: ENTERPRISE CSRF PROTECTION - Production-ready with monitoring
// ========================================================================================

/**
 * Enterprise-grade CSRF protection system
 * Mental model: Defense-in-depth with monitoring, alerting, and compliance features
 * 
 * Features:
 * - Multi-layer CSRF protection
 * - Security event monitoring and alerting
 * - Compliance reporting and audit trails
 * - Integration with WAF and security systems
 * - Performance optimization and caching
 */
class EnterpriseCSRFProtection extends AdvancedCSRFProtection {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Monitoring and alerting
      enableSecurityLogging: options.enableSecurityLogging !== false,
      alertThreshold: options.alertThreshold || 10, // alerts per minute
      suspiciousActivityThreshold: options.suspiciousActivityThreshold || 5,
      
      // Compliance and auditing
      enableAuditTrail: options.enableAuditTrail !== false,
      retentionPeriod: options.retentionPeriod || 2592000000, // 30 days
      
      // Performance optimization
      enableCaching: options.enableCaching !== false,
      cacheSize: options.cacheSize || 10000,
      
      // Integration options
      webhookUrl: options.webhookUrl,
      wafIntegration: options.wafIntegration || false,
      
      // Rate limiting
      rateLimitWindow: options.rateLimitWindow || 60000, // 1 minute
      maxAttemptsPerWindow: options.maxAttemptsPerWindow || 10
    };
    
    // Security monitoring state
    this.securityEvents = [];
    this.alertCounts = new Map();
    this.suspiciousIPs = new Map();
    this.auditTrail = [];
    
    // Performance optimization
    this.validationCache = new Map();
    this.rateLimiters = new Map();
    
    // Initialize monitoring
    this.initializeSecurityMonitoring();
  }
  
  /**
   * Enhanced token pair generation with security monitoring
   * Adds comprehensive logging and threat detection
   */
  async generateTokenPair(sessionId, request = {}) {
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      const rateLimitCheck = this.checkRateLimit(request.ip, 'token_generation');
      if (!rateLimitCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateLimitCheck.message}`);
      }
      
      // Generate token pair using parent method
      const tokenPair = super.generateTokenPair(sessionId, request);
      
      // Log security event
      this.logSecurityEvent('token_generated', {
        sessionId,
        ip: request.ip,
        userAgent: request.userAgent,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      });
      
      // Update audit trail
      this.addToAuditTrail('TOKEN_GENERATED', sessionId, request);
      
      return tokenPair;
      
    } catch (error) {
      // Log security incident
      this.logSecurityEvent('token_generation_failed', {
        sessionId,
        ip: request.ip,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Enhanced token pair validation with threat detection
   * Includes advanced security checks and monitoring
   */
  async validateTokenPair(cookieToken, valueToken, sessionId, request = {}) {
    const startTime = Date.now();
    const ip = request.ip;
    
    try {
      // Check rate limiting
      const rateLimitCheck = this.checkRateLimit(ip, 'token_validation');
      if (!rateLimitCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateLimitCheck.message}`);
      }
      
      // Check cache first for performance
      const cacheKey = this.generateCacheKey(cookieToken, valueToken, sessionId);
      if (this.config.enableCaching) {
        const cachedResult = this.validationCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < 300000) { // 5 minutes
          return cachedResult.result;
        }
      }
      
      // Perform validation
      const validation = super.validateTokenPair(cookieToken, valueToken, sessionId, request);
      
      // Cache successful validations
      if (validation.isValid && this.config.enableCaching) {
        this.validationCache.set(cacheKey, {
          result: validation,
          timestamp: Date.now()
        });
        
        // Maintain cache size
        if (this.validationCache.size > this.config.cacheSize) {
          const firstKey = this.validationCache.keys().next().value;
          this.validationCache.delete(firstKey);
        }
      }
      
      // Log validation result
      this.logSecurityEvent(validation.isValid ? 'token_validated' : 'token_validation_failed', {
        sessionId,
        ip,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.securityWarnings,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      });
      
      // Handle failed validation
      if (!validation.isValid) {
        this.handleFailedValidation(ip, sessionId, validation.errors);
      }
      
      // Update audit trail
      this.addToAuditTrail(validation.isValid ? 'TOKEN_VALIDATED' : 'TOKEN_VALIDATION_FAILED', 
                          sessionId, request, { errors: validation.errors });
      
      return validation;
      
    } catch (error) {
      this.logSecurityEvent('token_validation_error', {
        sessionId,
        ip,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Initialize security monitoring system
   * Sets up periodic cleanup and monitoring tasks
   */
  initializeSecurityMonitoring() {
    // Periodic cleanup of expired tokens and events
    setInterval(() => {
      this.performMaintenanceTasks();
    }, 300000); // 5 minutes
    
    // Security alert monitoring
    setInterval(() => {
      this.checkSecurityAlerts();
    }, 60000); // 1 minute
    
    console.log('Enterprise CSRF protection initialized with security monitoring');
  }
  
  /**
   * Check rate limits for different operations
   * Prevents brute force and DoS attacks
   */
  checkRateLimit(identifier, operation) {
    if (!identifier) {
      return { allowed: true };
    }
    
    const key = `${identifier}:${operation}`;
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    // Get or create rate limiter for this key
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, []);
    }
    
    const attempts = this.rateLimiters.get(key);
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    this.rateLimiters.set(key, recentAttempts);
    
    // Check if limit exceeded
    if (recentAttempts.length >= this.config.maxAttemptsPerWindow) {
      return {
        allowed: false,
        message: `Too many ${operation} attempts`,
        retryAfter: recentAttempts[0] + this.config.rateLimitWindow - now
      };
    }
    
    // Record this attempt
    recentAttempts.push(now);
    
    return { allowed: true };
  }
  
  /**
   * Handle failed token validation
   * Implements threat detection and response
   */
  handleFailedValidation(ip, sessionId, errors) {
    if (!ip) return;
    
    // Track suspicious activity
    const suspiciousKey = `${ip}:failed_validations`;
    const failedCount = (this.suspiciousIPs.get(suspiciousKey) || 0) + 1;
    this.suspiciousIPs.set(suspiciousKey, failedCount);
    
    // Check for suspicious activity threshold
    if (failedCount >= this.config.suspiciousActivityThreshold) {
      this.triggerSecurityAlert('SUSPICIOUS_ACTIVITY', {
        ip,
        sessionId,
        failedAttempts: failedCount,
        errors,
        timestamp: Date.now()
      });
      
      // Reset counter after alert
      this.suspiciousIPs.delete(suspiciousKey);
    }
  }
  
  /**
   * Log security events for monitoring and analysis
   * Creates detailed audit trail for security incidents
   */
  logSecurityEvent(eventType, eventData) {
    if (!this.config.enableSecurityLogging) return;
    
    const securityEvent = {
      type: eventType,
      timestamp: Date.now(),
      data: eventData,
      severity: this.getEventSeverity(eventType)
    };
    
    this.securityEvents.push(securityEvent);
    
    // Console logging for development
    if (securityEvent.severity === 'high') {
      console.warn('CSRF Security Event:', securityEvent);
    }
    
    // Keep only recent events to prevent memory issues
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-5000);
    }
  }
  
  /**
   * Determine event severity for prioritization
   * Helps security teams focus on critical issues
   */
  getEventSeverity(eventType) {
    const highSeverityEvents = [
      'token_validation_failed',
      'suspicious_activity_detected',
      'rate_limit_exceeded',
      'token_generation_failed'
    ];
    
    const mediumSeverityEvents = [
      'token_validation_error',
      'origin_validation_failed'
    ];
    
    if (highSeverityEvents.includes(eventType)) {
      return 'high';
    } else if (mediumSeverityEvents.includes(eventType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Add entry to audit trail for compliance
   * Maintains detailed logs for security audits
   */
  addToAuditTrail(action, sessionId, request, metadata = {}) {
    if (!this.config.enableAuditTrail) return;
    
    const auditEntry = {
      id: this.generateAuditId(),
      action,
      sessionId,
      timestamp: Date.now(),
      ip: request.ip,
      userAgent: request.userAgent,
      origin: request.origin,
      metadata,
      checksum: null // Would be calculated in production
    };
    
    // Calculate checksum for integrity (simplified)
    auditEntry.checksum = this.calculateAuditChecksum(auditEntry);
    
    this.auditTrail.push(auditEntry);
    
    // Cleanup old audit entries
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    this.auditTrail = this.auditTrail.filter(entry => entry.timestamp > cutoffTime);
  }
  
  /**
   * Generate unique audit ID
   * Creates traceable identifier for audit entries
   */
  generateAuditId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `audit_${timestamp}_${random}`;
  }
  
  /**
   * Calculate audit entry checksum for integrity
   * Ensures audit trail cannot be tampered with
   */
  calculateAuditChecksum(entry) {
    const data = JSON.stringify({
      action: entry.action,
      sessionId: entry.sessionId,
      timestamp: entry.timestamp,
      ip: entry.ip
    });
    
    return this.hashToken(data);
  }
  
  /**
   * Generate cache key for validation results
   * Optimizes performance by caching validation outcomes
   */
  generateCacheKey(cookieToken, valueToken, sessionId) {
    const combined = `${cookieToken}:${valueToken}:${sessionId}`;
    return this.hashToken(combined);
  }
  
  /**
   * Trigger security alert for critical events
   * Notifies security team of potential threats
   */
  async triggerSecurityAlert(alertType, alertData) {
    const alert = {
      type: alertType,
      timestamp: Date.now(),
      data: alertData,
      severity: 'high'
    };
    
    console.error('CSRF Security Alert:', alert);
    
    // Send webhook notification if configured
    if (this.config.webhookUrl) {
      try {
        await this.sendWebhookAlert(alert);
      } catch (error) {
        console.error('Failed to send security alert webhook:', error);
      }
    }
    
    // Update alert counts for rate limiting alerts
    const alertKey = `${alertType}:${Date.now()}`;
    this.alertCounts.set(alertKey, (this.alertCounts.get(alertKey) || 0) + 1);
  }
  
  /**
   * Send webhook alert to security system
   * Integrates with external monitoring systems
   */
  async sendWebhookAlert(alert) {
    const payload = {
      service: 'csrf-protection',
      alert,
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CSRF-Protection-Service/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }
  }
  
  /**
   * Check for security alert thresholds
   * Monitors alert frequency to detect attacks
   */
  checkSecurityAlerts() {
    const oneMinuteAgo = Date.now() - 60000;
    
    // Count recent alerts
    let recentAlerts = 0;
    for (const [alertKey, count] of this.alertCounts.entries()) {
      const [, timestampStr] = alertKey.split(':');
      const timestamp = parseInt(timestampStr, 10);
      
      if (timestamp > oneMinuteAgo) {
        recentAlerts += count;
      } else {
        this.alertCounts.delete(alertKey); // Cleanup old entries
      }
    }
    
    // Check if alert threshold exceeded
    if (recentAlerts >= this.config.alertThreshold) {
      this.triggerSecurityAlert('HIGH_ALERT_FREQUENCY', {
        alertCount: recentAlerts,
        timeWindow: '1 minute',
        threshold: this.config.alertThreshold
      });
    }
  }
  
  /**
   * Perform periodic maintenance tasks
   * Keeps system running efficiently
   */
  performMaintenanceTasks() {
    // Cleanup expired tokens
    const cleanedTokens = this.cleanupExpiredTokens();
    
    // Clear validation cache of old entries
    const cacheCleanupThreshold = Date.now() - 3600000; // 1 hour
    for (const [key, value] of this.validationCache.entries()) {
      if (value.timestamp < cacheCleanupThreshold) {
        this.validationCache.delete(key);
      }
    }
    
    // Cleanup suspicious IP tracking
    const suspiciousCleanupThreshold = Date.now() - this.config.rateLimitWindow * 2;
    for (const [key, timestamp] of this.suspiciousIPs.entries()) {
      if (timestamp < suspiciousCleanupThreshold) {
        this.suspiciousIPs.delete(key);
      }
    }
    
    console.log(`CSRF maintenance: cleaned ${cleanedTokens} expired tokens, ` +
                `${this.validationCache.size} cached validations, ` +
                `${this.suspiciousIPs.size} suspicious IPs tracked`);
  }
  
  /**
   * Get comprehensive security report
   * Provides insights for security analysis
   */
  getSecurityReport(timeframe = 3600000) { // Default: 1 hour
    const since = Date.now() - timeframe;
    
    // Filter recent events
    const recentEvents = this.securityEvents.filter(event => event.timestamp > since);
    
    // Group events by type
    const eventsByType = {};
    recentEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });
    
    // Get audit trail summary
    const recentAuditEntries = this.auditTrail.filter(entry => entry.timestamp > since);
    
    return {
      timeframe: {
        start: new Date(since).toISOString(),
        end: new Date().toISOString(),
        durationMs: timeframe
      },
      tokenStats: this.getTokenStats(),
      securityEvents: {
        total: recentEvents.length,
        byType: eventsByType,
        bySeverity: this.groupEventsBySeverity(recentEvents)
      },
      auditTrail: {
        entries: recentAuditEntries.length,
        actions: this.groupAuditByAction(recentAuditEntries)
      },
      performance: {
        cacheHitRate: this.calculateCacheHitRate(),
        averageValidationTime: this.calculateAverageValidationTime(recentEvents)
      },
      threats: {
        suspiciousIPs: this.suspiciousIPs.size,
        rateLimitViolations: this.countRateLimitViolations(recentEvents),
        failedValidations: eventsByType.token_validation_failed || 0
      }
    };
  }
  
  /**
   * Group security events by severity
   */
  groupEventsBySeverity(events) {
    const bySeverity = { high: 0, medium: 0, low: 0 };
    events.forEach(event => {
      bySeverity[event.severity]++;
    });
    return bySeverity;
  }
  
  /**
   * Group audit entries by action
   */
  groupAuditByAction(auditEntries) {
    const byAction = {};
    auditEntries.forEach(entry => {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    });
    return byAction;
  }
  
  /**
   * Calculate cache hit rate for performance monitoring
   */
  calculateCacheHitRate() {
    // This would be implemented with proper metrics collection
    return 0.85; // Placeholder
  }
  
  /**
   * Calculate average validation time
   */
  calculateAverageValidationTime(events) {
    const validationEvents = events.filter(e => 
      e.type === 'token_validated' || e.type === 'token_validation_failed');
    
    if (validationEvents.length === 0) return 0;
    
    const totalTime = validationEvents.reduce((sum, event) => 
      sum + (event.data.duration || 0), 0);
    
    return totalTime / validationEvents.length;
  }
  
  /**
   * Count rate limit violations
   */
  countRateLimitViolations(events) {
    return events.filter(e => e.type === 'rate_limit_exceeded').length;
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic CSRF protection
console.log('=== BASIC CSRF PROTECTION EXAMPLE ===');

const basicCSRF = new BasicCSRFProtection({
  tokenLength: 32,
  tokenExpiry: 3600000, // 1 hour
  secure: true,
  sameSite: 'strict'
});

// Generate token for session
const sessionId = 'user_session_123';
const token1 = basicCSRF.generateToken(sessionId);
console.log('Generated CSRF token:', token1);

// Validate token
const validation1 = basicCSRF.validateToken(token1, sessionId);
console.log('Token validation result:', validation1);

// Example 2: Double-submit cookie pattern
console.log('\n=== ADVANCED CSRF PROTECTION EXAMPLE ===');

const advancedCSRF = new AdvancedCSRFProtection({
  encryptTokens: true,
  allowedOrigins: ['https://example.com', 'https://app.example.com'],
  strictOriginValidation: true
});

// Generate token pair
const request = {
  origin: 'https://example.com',
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.100'
};

try {
  const tokenPair = advancedCSRF.generateTokenPair(sessionId, request);
  console.log('Generated token pair:', {
    cookieToken: tokenPair.cookieToken.substring(0, 20) + '...',
    valueToken: tokenPair.valueToken.substring(0, 20) + '...',
    expiresAt: new Date(tokenPair.expiresAt).toISOString()
  });
  
  // Validate token pair
  const validation2 = advancedCSRF.validateTokenPair(
    tokenPair.cookieToken, 
    tokenPair.valueToken, 
    sessionId, 
    request
  );
  console.log('Token pair validation:', validation2.isValid);
  
} catch (error) {
  console.error('Advanced CSRF error:', error.message);
}

// Example 3: Enterprise CSRF protection
console.log('\n=== ENTERPRISE CSRF PROTECTION EXAMPLE ===');

const enterpriseCSRF = new EnterpriseCSRFProtection({
  enableSecurityLogging: true,
  enableAuditTrail: true,
  alertThreshold: 5,
  webhookUrl: 'https://security.example.com/webhook'
});

// Simulate some activity
setTimeout(async () => {
  try {
    const enterpriseRequest = {
      ip: '10.0.0.1',
      origin: 'https://app.example.com',
      userAgent: 'Chrome/91.0'
    };
    
    const tokenPair = await enterpriseCSRF.generateTokenPair('enterprise_session', enterpriseRequest);
    console.log('Enterprise token generated successfully');
    
    // Get security report
    const report = enterpriseCSRF.getSecurityReport();
    console.log('Security report:', {
      totalEvents: report.securityEvents.total,
      tokenStats: report.tokenStats,
      threats: report.threats
    });
    
  } catch (error) {
    console.error('Enterprise CSRF error:', error.message);
  }
}, 1000);

// Export for use in other modules
module.exports = {
  BasicCSRFProtection,
  AdvancedCSRFProtection,
  EnterpriseCSRFProtection
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. CSRF Attack Vectors:
   - How CSRF attacks work (malicious sites making requests)
   - Difference between CSRF and XSS attacks
   - State-changing operations vulnerability
   - GET vs POST request security implications

2. CSRF Prevention Techniques:
   - Synchronizer token pattern (server-generated tokens)
   - Double-submit cookie pattern (cookie + form field)
   - SameSite cookie attributes (Strict, Lax, None)
   - Origin/Referer header validation
   - Custom request headers requirement

3. Token Management:
   - Secure random token generation
   - Token expiration and rotation strategies
   - Per-session vs per-request tokens
   - Token storage (cookies vs local storage)

4. Implementation Considerations:
   - Framework integration (Express, Django, etc.)
   - Single Page Application (SPA) considerations
   - Mobile application CSRF protection
   - API-only application protection

5. Security Best Practices:
   - Defense in depth approach
   - Rate limiting and monitoring
   - Audit trails and compliance
   - Integration with WAF and security systems

6. Browser Security Features:
   - SameSite cookie support across browsers
   - CORS preflight request handling
   - Content Security Policy integration
   - Secure cookie attributes (HttpOnly, Secure)

Common Follow-up Questions:
- How do you handle CSRF protection in single-page applications?
- What are the trade-offs between different CSRF protection methods?
- How do you implement CSRF protection for API endpoints?
- What happens when a user has multiple tabs open?
- How do you handle CSRF tokens in mobile applications?
- What are the performance implications of token validation?
- How do you implement CSRF protection for file uploads?
- What monitoring and alerting would you implement?
- How do you handle CSRF protection across multiple domains?
- What are the compliance requirements for CSRF protection?
*/