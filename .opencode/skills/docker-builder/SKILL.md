---
name: docker-builder
description: Build optimized multi-stage Docker images with security best practices
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: developers-devops
---

## What I do

- Write production-ready Dockerfiles with multi-stage builds, layer caching, and minimal attack surface
- Set up Docker Compose for local development with hot-reload and service orchestration
- Apply security best practices: non-root users, pinned base images, distroless, vulnerability scanning

## When to use me

Use when: Dockerizing an application, optimizing an existing Dockerfile, setting up Docker Compose, or preparing for containerized deployment. Trigger phrases: "Dockerize this app...", "create a Dockerfile for...", "set up Docker Compose...", "optimize my Docker image...", "add a Dockerfile...".

## Workflow

1. Understand the application: runtime (Node.js, Python, Go, etc.), build process, dependencies, port, and any required system packages
2. Write a multi-stage Dockerfile:
   - **Stage 1 (build)**: install dev dependencies, compile/build the app, run tests
   - **Stage 2 (production)**: copy only built artifacts, install only production dependencies, minimal base image
3. Optimize layer caching:
   - Copy package manifests first, install dependencies, then copy source code
   - Use `.dockerignore` to exclude node_modules, .git, build artifacts, env files
4. Security hardening:
   - Use specific base image tags (not `latest`)
   - Run as non-root user (`USER node` or `USER 1001`)
   - Use distroless or Alpine for minimal attack surface
   - Never COPY `.env` files
   - Set `HEALTHCHECK` instruction
5. For Docker Compose:
   - Define services with proper depends_on, healthchecks, and restart policies
   - Mount source code for hot-reload in development
   - Use named volumes for persistent data (databases)
   - Set resource limits (memory, CPU)
6. Test the build: `docker build -t app . && docker run -p 3000:3000 app`
7. Verify: `docker scout quickview` or `docker scan` for vulnerabilities

## Dockerfile template (Node.js)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```
