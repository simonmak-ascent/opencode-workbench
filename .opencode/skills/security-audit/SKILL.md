---
name: security-audit
description: Research and apply security best practices for web applications
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: developers-security
---

## What I do

- Research and audit security posture: OWASP Top 10 coverage, authentication patterns, data protection, secret management, and supply chain risks
- Produce a prioritized remediation plan with code-level fixes
- Stay current with framework-specific security advisories

## When to use me

Use when: doing a security review before launch, responding to a vulnerability disclosure, implementing auth, or hardening an existing app. Trigger phrases: "security audit for...", "is this authentication secure", "OWASP review of...", "how to secure...", "check for security issues in...".

## Workflow

1. Understand the application's security context: auth model, data sensitivity, compliance requirements (GDPR, HIPAA, PCI), threat model
2. Audit against OWASP Top 10:
   - Broken Access Control — check route guards, role checks, API auth
   - Cryptographic Failures — check hashing (bcrypt/argon2), TLS, sensitive data exposure
   - Injection — SQL, NoSQL, command injection vectors
   - Insecure Design — missing rate limiting, missing input validation
   - Security Misconfiguration — CORS, CSP headers, verbose errors, default creds
   - Vulnerable Components — dependencies with known CVEs
   - Auth Failures — session management, JWT handling, MFA support
   - Software & Data Integrity — unsigned updates, insecure deserialization
   - Logging & Monitoring — audit trails, alerting gaps
   - SSRF — URL validation, internal service exposure
3. For each finding, provide: severity, CVSS-style score, affected code, fix with code example
4. Check for framework-specific security best practices using Context7 docs
5. Include a secure coding checklist for the team

## Output format

```markdown
# Security Audit: [Application]
## Scope & Context
## Findings by Severity
### Critical
### High
### Medium
### Low
## Remediation Plan (prioritized)
## Framework-Specific Guidance
## Secure Coding Checklist
```
