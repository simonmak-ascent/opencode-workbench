# OpenCode Workbench MCP server — stdio image for self-hosting / Glama builds.
#
# Builds the TypeScript MCP server and runs the stdio entrypoint
# (mcp-server/dist/index.js). No environment variables or network access are
# required at runtime. Glama wraps the stdio entrypoint with mcp-proxy.
FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS build

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

FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914

# Provenance: so `docker inspect` can name the release without running it.
ARG VERSION=0.0.0
ARG REVISION=unknown
ARG SOURCE=https://github.com/simonmak-ascent/opencode-workbench
LABEL org.opencontainers.image.title="opencode-workbench" \
      org.opencontainers.image.description="Provision an OpenCode workbench and MCP stack on any Linux box, local or over SSH." \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="${SOURCE}" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/mcp-server/dist ./mcp-server/dist

# Read at runtime by the server (falls back to a remote fetch if absent).
COPY opencode.json connector.json workbench.versions.json ./

ENTRYPOINT ["node", "mcp-server/dist/index.js"]
