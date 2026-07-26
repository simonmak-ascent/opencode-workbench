---
name: auth-flow
description: Implement secure authentication and authorization flows with best practices
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: fullstack-developers
---

## What I do

- Implement authentication flows (login, register, password reset, MFA, SSO) and authorization (RBAC, policies)
- Use the project's existing auth library (Clerk, NextAuth, Lucia, Auth0, Supabase Auth) following their patterns
- Ensure security best practices: secure sessions, CSRF protection, rate limiting, proper password hashing

## When to use me

Use when: adding auth to a route, implementing login/registration, setting up role-based access, integrating an auth provider, or hardening existing auth. Trigger phrases: "add auth to...", "implement login for...", "set up role-based access...", "integrate Clerk/Auth0/NextAuth...", "add MFA to...".

## Workflow

1. Identify the auth provider and patterns already in use — read existing middleware, session handling, and auth config
2. For the requested auth feature, implement:
   - **Authentication**: credential validation, session/token creation, secure cookie settings, redirect after login
   - **Authorization**: role/permission checks at route, middleware, and data-access levels
   - **Password flows**: bcrypt/argon2 hashing, reset tokens with expiry, secure email delivery
   - **MFA**: TOTP or WebAuthn setup and verification flows
   - **SSO**: OAuth2/OIDC flow with state parameter, PKCE where applicable
3. Wire into the project's middleware chain or decorator pattern
4. Add rate limiting on auth endpoints (login, reset, MFA)
5. Write tests for: successful auth, invalid credentials, expired tokens, permission denial, MFA flow
6. Generate any required env vars and document them

## Security checklist

- Passwords hashed with bcrypt (cost ≥ 10) or argon2id
- Sessions use httpOnly, secure, sameSite=strict cookies
- CSRF tokens for state-changing operations
- Rate limit login attempts (5/min per IP+account)
- Password reset tokens: 64+ bytes random, expire in ≤ 1 hour, single-use
- No auth secrets in client-side code
