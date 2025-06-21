# Security Guide

This document outlines the security measures implemented in the Annotator App and provides guidelines for secure deployment and operation.

## Security Features

### Authentication & Authorization

- **Multi-Factor Authentication (MFA)**: Required for enterprise users and high-privilege roles
- **OAuth Integration**: Support for Google and GitHub OAuth
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Session Management**: Secure session handling with automatic timeout
- **Password Policy**: Strong password requirements with complexity validation

### Data Protection

- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **CSRF Protection**: Cross-Site Request Forgery protection with token validation
- **Content Security Policy (CSP)**: Strict CSP headers to prevent code injection
- **Secure Headers**: Comprehensive security headers implementation
- **File Upload Security**: Type validation, size limits, and malware scanning

### Infrastructure Security

- **HTTPS Enforcement**: All communications encrypted in transit
- **Rate Limiting**: Protection against brute force and DoS attacks
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, etc.
- **Environment Isolation**: Separate configurations for different environments

## Deployment Checklist

### Pre-Deployment

- [ ] Update all dependencies to latest secure versions
- [ ] Run security audit: `npm audit`
- [ ] Run vulnerability scan: `npm audit fix`
- [ ] Review and update environment variables
- [ ] Verify SSL/TLS certificates are valid
- [ ] Test authentication flows in staging environment
- [ ] Verify MFA setup for enterprise users
- [ ] Test file upload restrictions
- [ ] Validate CSP policies don't break functionality

### Environment Configuration

#### Production Environment Variables

```bash
# Security
VITE_SECURITY_ENABLE_CSP=true
VITE_SECURITY_ENABLE_HSTS=true
VITE_SECURITY_ENABLE_XSS_PROTECTION=true
VITE_SECURITY_ENABLE_CONTENT_TYPE_NOSNIFF=true
VITE_SECURITY_ENABLE_REFERRER_POLICY=true
VITE_SECURITY_ENABLE_PERMISSIONS_POLICY=true

# Rate Limiting
VITE_RATE_LIMIT_ENABLE=true
VITE_RATE_LIMIT_WINDOW=900000
VITE_RATE_LIMIT_MAX_REQUESTS=100

# Authentication
VITE_AUTH_SESSION_TIMEOUT=1800000
VITE_AUTH_MAX_LOGIN_ATTEMPTS=5
VITE_AUTH_LOCKOUT_DURATION=900000

# Features
VITE_FEATURE_MFA_ENABLED=true
VITE_FEATURE_SOCIAL_AUTH_ENABLED=true

# Logging
VITE_LOG_LEVEL=warn
VITE_LOG_ENABLE_CONSOLE=false
VITE_LOG_ENABLE_REMOTE=true

# Compliance
VITE_COMPLIANCE_GDPR_ENABLED=true
VITE_COMPLIANCE_AUDIT_LOG_ENABLED=true
```

### Server Configuration

#### Nginx Configuration Example

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # File Upload Limits
    client_max_body_size 50M;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Post-Deployment

- [ ] Verify HTTPS is working correctly
- [ ] Test security headers using online tools
- [ ] Verify CSP is not blocking legitimate resources
- [ ] Test authentication flows in production
- [ ] Verify MFA setup works for enterprise users
- [ ] Test file upload functionality and restrictions
- [ ] Monitor error logs for security issues
- [ ] Set up security monitoring and alerting

## Security Monitoring

### Key Metrics to Monitor

1. **Authentication Failures**: Track failed login attempts
2. **Rate Limit Violations**: Monitor for potential attacks
3. **File Upload Rejections**: Track malicious file upload attempts
4. **CSP Violations**: Monitor for XSS attempts
5. **Session Anomalies**: Detect unusual session patterns

### Logging Configuration

The application logs security events including:

- Authentication attempts (success/failure)
- Authorization failures
- File upload attempts
- Rate limit violations
- CSP violations
- Session management events

### Alerting Rules

Set up alerts for:

- Multiple failed login attempts from same IP
- Unusual number of CSP violations
- High rate of file upload rejections
- Suspicious session patterns
- Error rate spikes

## Incident Response

### Security Incident Checklist

1. **Immediate Response**
   - [ ] Assess the scope and impact
   - [ ] Contain the incident
   - [ ] Preserve evidence
   - [ ] Notify stakeholders

2. **Investigation**
   - [ ] Analyze logs and monitoring data
   - [ ] Identify root cause
   - [ ] Document findings
   - [ ] Assess data exposure

3. **Recovery**
   - [ ] Implement fixes
   - [ ] Verify security measures
   - [ ] Monitor for recurrence
   - [ ] Update security policies

4. **Post-Incident**
   - [ ] Conduct post-mortem
   - [ ] Update procedures
   - [ ] Implement additional safeguards
   - [ ] Train team on lessons learned

## Security Best Practices

### For Developers

1. **Input Validation**: Always validate and sanitize user inputs
2. **Authentication**: Use secure authentication mechanisms
3. **Authorization**: Implement proper access controls
4. **Error Handling**: Don't expose sensitive information in errors
5. **Logging**: Log security events without exposing sensitive data
6. **Dependencies**: Keep dependencies updated and audit regularly

### For Administrators

1. **Access Control**: Implement principle of least privilege
2. **Monitoring**: Set up comprehensive security monitoring
3. **Backups**: Maintain secure, tested backups
4. **Updates**: Keep systems and dependencies updated
5. **Training**: Provide security awareness training
6. **Incident Response**: Have a documented incident response plan

## Compliance

### GDPR Compliance

- User consent management
- Data portability features
- Right to be forgotten implementation
- Privacy policy and terms of service
- Data processing records

### Security Standards

- OWASP Top 10 compliance
- Secure coding practices
- Regular security assessments
- Penetration testing
- Vulnerability management

## Contact

For security issues or questions, please contact:

- Security Team: security@yourcompany.com
- Emergency: +1-XXX-XXX-XXXX

## Updates

This security guide should be reviewed and updated:

- After any security incidents
- When new features are added
- At least quarterly
- When security standards change

Last Updated: [Current Date]
Version: 1.0
