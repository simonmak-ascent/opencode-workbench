---
name: cloud-deploy
description: Deploy applications to cloud platforms with infrastructure-as-code
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: developers-devops
---

## What I do

- Deploy applications to cloud platforms (Vercel, AWS, Railway, Fly.io, Render, Cloudflare) following the project's deployment patterns
- Configure environment variables, secrets, domains, and scaling
- Set up preview deployments for branches and PRs

## When to use me

Use when: deploying a new app, setting up a deployment pipeline, migrating between platforms, or configuring production infrastructure. Trigger phrases: "deploy to Vercel/AWS/Railway...", "set up deployment for...", "configure production environment...", "add preview deployments...".

## Workflow

1. Detect the project's deployment target from existing configs (vercel.json, fly.toml, railway.json, Dockerfile, terraform, etc.)
2. Verify the deployment configuration:
   - Framework-specific build settings (Next.js output: 'standalone', SvelteKit adapter, Astro adapter)
   - Node.js/Python/Go version
   - Build command and output directory
   - Environment variables (from `.env.example` or existing `.env` files)
   - Secret management (never commit secrets; use platform secret stores)
3. For each environment (preview, staging, production):
   - Set appropriate scaling (min/max instances, CPU/memory)
   - Configure domain and SSL
   - Set up health checks
   - Configure logging and monitoring
4. Set up preview deployments:
   - Auto-deploy on PR creation
   - Unique URL per PR
   - Auto-cleanup on PR close
5. Run a smoke test after deployment:
   - Health endpoint returns 200
   - Critical pages render
   - API endpoints respond
6. Document: deployment URL, how to access logs, how to roll back

## Platform-specific notes

- **Vercel**: vercel.json with framework preset, use `--prod` for production
- **Railway**: railway.json or nixpacks, use service variables
- **Fly.io**: fly.toml, use `fly secrets set`
- **AWS**: prefer CDK or SST over raw CloudFormation
- **Cloudflare**: wrangler.toml for Workers/Pages
