# Security Policy

## Supported Versions

We take security seriously. The following versions of Sight Word Story Generator are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

If you discover a security vulnerability, please email us at:

**security@[your-domain].com** (Update with actual contact)

Or use GitHub's private vulnerability reporting:

1. Go to the "Security" tab
2. Click "Report a vulnerability"
3. Fill out the form

### What to Include

Please include the following information:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Location** (file path, URL, or specific component)
- **Step-by-step instructions** to reproduce the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### Example Report

```text
Subject: [SECURITY] Authentication Bypass in User Login

Description:
I found a way to bypass authentication by...

Steps to Reproduce:
1. Navigate to /login
2. Enter username: admin' OR '1'='1
3. [etc.]

Impact:
An attacker could gain unauthorized access to any user account.

Suggested Fix:
Use parameterized queries instead of string concatenation.

Contact: researcher@security.com
```

## Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Next scheduled release

## Security Update Process

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Investigation**: We'll verify and assess the vulnerability
3. **Fix Development**: We'll develop and test a patch
4. **Disclosure**: We'll coordinate disclosure with you
5. **Release**: We'll release the fix and credit you (if desired)

## Vulnerability Disclosure Policy

We follow coordinated disclosure:

- We'll work with you to understand and fix the issue
- We won't publicly disclose until a fix is available
- We'll credit you in the security advisory (unless you prefer anonymity)
- We ask that you don't publicly disclose before we release a fix

## Security Best Practices

### For Users/Administrators

1. **Keep Software Updated**
   - Always use the latest version
   - Update dependencies regularly
   - Subscribe to security announcements

2. **Secure Your Environment**
   - Use strong, unique passwords
   - Enable two-factor authentication (when available)
   - Keep your `.env.local` file secure
   - Never commit credentials to version control
   - Use environment variables for secrets

3. **Rotate Credentials**
   - Change database passwords regularly
   - Rotate API keys every 90 days
   - Update NextAuth secret on security concerns

4. **Database Security**
   - Use MongoDB Atlas with IP whitelisting
   - Enable MongoDB authentication
   - Use TLS/SSL for database connections
   - Limit database user permissions (principle of least privilege)

5. **Email Security**
   - Use app-specific passwords for SMTP
   - Don't store email passwords in plain text
   - Use secure SMTP connections (TLS)

### For Developers

1. **Code Security**
   - Never commit `.env.local` or secrets
   - Validate all user inputs
   - Use parameterized queries (Mongoose does this)
   - Sanitize HTML output
   - Implement rate limiting on APIs
   - Use HTTPS in production

2. **Authentication**
   - Use bcrypt with salt rounds ≥ 10
   - Implement proper session management
   - Validate JWT tokens correctly
   - Use secure, random secrets

3. **Dependencies**
   - Run `npm audit` regularly
   - Update dependencies to patch vulnerabilities
   - Review dependencies before adding them

4. **Testing**
   - Test authentication and authorization
   - Test input validation
   - Test for common vulnerabilities (OWASP Top 10)

## Known Security Considerations

### Current Implementation

1. **Password Storage**: Uses bcrypt with 10 salt rounds ✅
2. **Session Management**: JWT-based with NextAuth ✅
3. **Database**: MongoDB with connection pooling ✅
4. **Input Validation**: Basic validation on API endpoints ⚠️
5. **Rate Limiting**: Not implemented yet ❌
6. **CSRF Protection**: NextAuth provides this ✅
7. **XSS Prevention**: React escapes by default ✅
8. **SQL Injection**: N/A (using MongoDB) ✅

### Areas for Improvement

- [ ] Implement rate limiting on API endpoints
- [ ] Add Content Security Policy headers
- [ ] Implement request size limits
- [ ] Add API key rotation mechanism
- [ ] Implement audit logging
- [ ] Add IP-based brute force protection
- [ ] Implement account lockout after failed attempts

## Common Vulnerabilities

### We Protect Against

- ✅ SQL Injection (using Mongoose ORM)
- ✅ Password Hash Cracking (bcrypt with salt)
- ✅ Session Hijacking (secure JWT implementation)
- ✅ XSS (React's automatic escaping)
- ✅ CSRF (NextAuth protection)

### Areas of Concern

- ⚠️ **No Rate Limiting**: APIs vulnerable to abuse
- ⚠️ **No Input Sanitization**: User-generated content not fully sanitized
- ⚠️ **Email Injection**: Email sharing could be vulnerable if not properly validated

## Responsible Disclosure Hall of Fame

We recognize security researchers who help us keep our users safe:

*No researchers credited yet - be the first!*

## Security-Related Configuration

### Recommended Headers

Add these to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

### Environment Security Checklist

- [ ] All secrets in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] Different credentials for dev/prod
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Database connection uses TLS
- [ ] Email uses secure SMTP
- [ ] API keys have limited permissions

## Contact

For security concerns: **security@[your-domain].com**

For general questions: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

Last Updated: 2026-01-09
