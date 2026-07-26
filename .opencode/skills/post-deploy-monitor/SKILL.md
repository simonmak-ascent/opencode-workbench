---
name: post-deploy-monitor
description: Set up post-deployment monitoring, alerting, and incident response
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: developers-sre
---

## What I do

- Set up post-deployment monitoring: health checks, error tracking, performance monitoring, and alerting
- Configure dashboards for key metrics (errors, latency, throughput, saturation)
- Define incident response playbooks and runbooks

## When to use me

Use when: setting up monitoring for a newly deployed app, configuring alerts, setting up a status page, or preparing an incident response plan. Trigger phrases: "set up monitoring for...", "configure alerts for...", "add health checks...", "monitor my deployment...", "set up Sentry/Datadog/...".

## Workflow

1. Identify what to monitor across the key signals:
   - **Errors**: Sentry, Bugsnag, or Rollbar for application errors with stack traces
   - **Performance**: response times, database query durations, external API call latency
   - **Availability**: uptime checks, SSL certificate expiry, health endpoint monitoring
   - **Business metrics**: signup rate, payment success rate, key user actions
   - **Infrastructure**: CPU, memory, disk, connection pools, rate limit remaining
2. Set up monitoring tools based on the project's stack:
   - Existing tools: integrate with what's already configured
   - New setup: Sentry for errors, a status page service, log aggregation (if needed)
3. Configure health check endpoints:
   - `/health`: basic liveness (always returns 200 if the process is running)
   - `/health/ready`: readiness (checks DB connection, external service availability)
4. Set up alerting with thresholds:
   - Error rate > X% of requests in 5 minutes → alert
   - p95 latency > 2x baseline for 10 minutes → alert
   - Health check failing for > 2 minutes → page on-call
5. Create a basic incident response plan:
   - Severity levels: SEV1 (critical outage), SEV2 (degraded), SEV3 (minor)
   - Response: who to contact, how to roll back, where to find logs
6. Set up a deployment notification (Slack/Discord) with:
   - Version deployed
   - Commit range and changelog
   - Link to deployment logs
   - Rollback command

## Health check example

```typescript
// GET /health
{ "status": "ok", "uptime": 3600, "version": "2.1.0" }

// GET /health/ready
{ "status": "ready", "db": "connected", "redis": "connected" }
```
