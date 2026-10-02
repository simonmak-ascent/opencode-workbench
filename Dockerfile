# OpenCode Workbench MCP server — stdio image for self-hosting / Glama builds.
#
# Builds the TypeScript MCP server and runs the stdio entrypoint
# (mcp-server/dist/index.js). No environment variables or network access are
# required at runtime. Glama wraps the stdio entrypoint with mcp-proxy.
FROM node:22-alpine AS build

# Pin pnpm 9 to match the repo lockfile and CI (pnpm 10's registry policy
# rejects this lockfile).
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY mcp-server ./mcp-server

# --ignore-scripts skips `prepare` (which would run the build with npm); we
# build explicitly below.
RUN pnpm install --no-frozen-lockfile --ignore-scripts

RUN pnpm build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/mcp-server/dist ./mcp-server/dist

# Read at runtime by the server (falls back to a remote fetch if absent).
COPY opencode.json connector.json ./

ENTRYPOINT ["node", "mcp-server/dist/index.js"]
