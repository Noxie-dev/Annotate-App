/**
 * Security Configuration
 * 
 * This file contains all security-related configuration for the application.
 * It includes CSP policies, security headers, rate limiting, and other security measures.
 */

export interface SecurityConfig {
  csp: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportUri?: string;
    reportOnly: boolean;
  };
  headers: {
    hsts: {
      enabled: boolean;
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    xssProtection: {
      enabled: boolean;
      mode: 'block' | 'sanitize';
    };
    contentTypeOptions: {
      enabled: boolean;
    };
    referrerPolicy: {
      enabled: boolean;
      policy: string;
    };
    permissionsPolicy: {
      enabled: boolean;
      directives: Record<string, string[]>;
    };
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  auth: {
    tokenExpiry: number;
    refreshTokenExpiry: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireMfaForRoles: string[];
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventCommonPasswords: boolean;
      preventReuse: number;
    };
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
    scanForMalware: boolean;
    quarantineDirectory: string;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
    saltLength: number;
  };
  audit: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    retentionDays: number;
    sensitiveFields: string[];
  };
}

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityConfig = {
  csp: {
    enabled: import.meta.env.VITE_SECURITY_ENABLE_CSP === 'true',
    reportOnly: import.meta.env.VITE_APP_ENVIRONMENT === 'development',
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Vite in development
        "'unsafe-eval'",   // Required for Vite in development
        'https://apis.google.com',
        'https://accounts.google.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for CSS-in-JS libraries
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com'
      ],
      'connect-src': [
        "'self'",
        'https://api.qrserver.com',
        'https://accounts.google.com',
        'https://github.com',
        'wss://localhost:*',
        'ws://localhost:*'
      ],
      'frame-src': [
        "'none'"
      ],
      'object-src': [
        "'none'"
      ],
      'base-uri': [
        "'self'"
      ],
      'form-action': [
        "'self'"
      ],
      'frame-ancestors': [
        "'none'"
      ],
      'upgrade-insecure-requests': []
    }
  },
  headers: {
    hsts: {
      enabled: import.meta.env.VITE_SECURITY_ENABLE_HSTS === 'true',
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    xssProtection: {
      enabled: import.meta.env.VITE_SECURITY_ENABLE_XSS_PROTECTION === 'true',
      mode: 'block'
    },
    contentTypeOptions: {
      enabled: import.meta.env.VITE_SECURITY_ENABLE_CONTENT_TYPE_NOSNIFF === 'true'
    },
    referrerPolicy: {
      enabled: import.meta.env.VITE_SECURITY_ENABLE_REFERRER_POLICY === 'true',
      policy: 'strict-origin-when-cross-origin'
    },
    permissionsPolicy: {
      enabled: import.meta.env.VITE_SECURITY_ENABLE_PERMISSIONS_POLICY === 'true',
      directives: {
        'camera': [],
        'microphone': [],
        'geolocation': [],
        'payment': [],
        'usb': [],
        'magnetometer': [],
        'gyroscope': [],
        'accelerometer': []
      }
    }
  },
  rateLimit: {
    enabled: import.meta.env.VITE_RATE_LIMIT_ENABLE === 'true',
    windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS || '100'),
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  auth: {
    tokenExpiry: parseInt(import.meta.env.VITE_AUTH_TOKEN_EXPIRY || '3600000'), // 1 hour
    refreshTokenExpiry: parseInt(import.meta.env.VITE_AUTH_REFRESH_TOKEN_EXPIRY || '604800000'), // 7 days
    sessionTimeout: parseInt(import.meta.env.VITE_AUTH_SESSION_TIMEOUT || '1800000'), // 30 minutes
    maxLoginAttempts: parseInt(import.meta.env.VITE_AUTH_MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration: parseInt(import.meta.env.VITE_AUTH_LOCKOUT_DURATION || '900000'), // 15 minutes
    requireMfaForRoles: ['Enterprise User', 'Admin', 'Team Lead'],
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventReuse: 5
    }
  },
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_UPLOAD_MAX_FILE_SIZE || '52428800'), // 50MB
    allowedTypes: (import.meta.env.VITE_UPLOAD_ALLOWED_TYPES || '').split(',').filter(Boolean),
    maxFiles: parseInt(import.meta.env.VITE_UPLOAD_MAX_FILES || '10'),
    scanForMalware: true,
    quarantineDirectory: '/tmp/quarantine'
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 16,
    saltLength: 32
  },
  audit: {
    enabled: import.meta.env.VITE_COMPLIANCE_AUDIT_LOG_ENABLED === 'true',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'info',
    retentionDays: 90,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'creditCard',
      'bankAccount'
    ]
  }
};

/**
 * Get security configuration with environment overrides
 */
export function getSecurityConfig(): SecurityConfig {
  return defaultSecurityConfig;
}

/**
 * Generate Content Security Policy header value
 */
export function generateCSPHeader(config: SecurityConfig['csp']): string {
  if (!config.enabled) return '';

  const directives = Object.entries(config.directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');

  return directives;
}

/**
 * Generate security headers object
 */
export function generateSecurityHeaders(config: SecurityConfig): Record<string, string> {
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (config.csp.enabled) {
    const cspValue = generateCSPHeader(config.csp);
    if (cspValue) {
      const headerName = config.csp.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      headers[headerName] = cspValue;
    }
  }

  // HTTP Strict Transport Security
  if (config.headers.hsts.enabled) {
    let hstsValue = `max-age=${config.headers.hsts.maxAge}`;
    if (config.headers.hsts.includeSubDomains) {
      hstsValue += '; includeSubDomains';
    }
    if (config.headers.hsts.preload) {
      hstsValue += '; preload';
    }
    headers['Strict-Transport-Security'] = hstsValue;
  }

  // X-XSS-Protection
  if (config.headers.xssProtection.enabled) {
    headers['X-XSS-Protection'] = config.headers.xssProtection.mode === 'block' 
      ? '1; mode=block' 
      : '1';
  }

  // X-Content-Type-Options
  if (config.headers.contentTypeOptions.enabled) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // Referrer-Policy
  if (config.headers.referrerPolicy.enabled) {
    headers['Referrer-Policy'] = config.headers.referrerPolicy.policy;
  }

  // Permissions-Policy
  if (config.headers.permissionsPolicy.enabled) {
    const permissionsValue = Object.entries(config.headers.permissionsPolicy.directives)
      .map(([directive, allowlist]) => {
        if (allowlist.length === 0) {
          return `${directive}=()`;
        }
        return `${directive}=(${allowlist.join(' ')})`;
      })
      .join(', ');
    
    if (permissionsValue) {
      headers['Permissions-Policy'] = permissionsValue;
    }
  }

  // X-Frame-Options (fallback for older browsers)
  headers['X-Frame-Options'] = 'DENY';

  return headers;
}

/**
 * Validate file upload against security policy
 */
export function validateFileUpload(
  file: File, 
  config: SecurityConfig['upload']
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.maxFileSize} bytes`
    };
  }

  // Check file type
  if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = config.allowedTypes
    .map(type => {
      const extensionMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'text/plain': 'txt',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx'
      };
      return extensionMap[type];
    })
    .filter(Boolean);

  if (allowedExtensions.length > 0 && extension && !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension .${extension} is not allowed`
    };
  }

  return { valid: true };
}

/**
 * Security configuration instance
 */
export const securityConfig = getSecurityConfig();
