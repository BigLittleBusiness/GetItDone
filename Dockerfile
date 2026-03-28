# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for the build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the Vite frontend + bundle the Express server + bundle the worker
# VITE_* env vars must be provided at build time for the frontend bundle.
# Pass them as --build-arg in CI/CD:
#   docker build --build-arg VITE_APP_ID=xxx ...
ARG VITE_APP_ID
ARG VITE_APP_TITLE
ARG VITE_APP_LOGO
ARG VITE_OAUTH_PORTAL_URL
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID
ARG VITE_FRONTEND_FORGE_API_URL
ARG VITE_FRONTEND_FORGE_API_KEY

ENV VITE_APP_ID=$VITE_APP_ID \
    VITE_APP_TITLE=$VITE_APP_TITLE \
    VITE_APP_LOGO=$VITE_APP_LOGO \
    VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL \
    VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT \
    VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID \
    VITE_FRONTEND_FORGE_API_URL=$VITE_FRONTEND_FORGE_API_URL \
    VITE_FRONTEND_FORGE_API_KEY=$VITE_FRONTEND_FORGE_API_KEY

# pnpm build now produces both dist/index.js (web server) and dist/worker.js
RUN pnpm build

# ─── Stage 2: Web Server image ────────────────────────────────────────────────
#
# This image runs the Express web server (handles HTTP requests and tRPC calls).
# Deploy as the primary service in ECS / App Runner / Kubernetes.
#
# Runtime environment variables (set in ECS task definition / App Runner):
#   DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, OAUTH_SERVER_URL, OWNER_OPEN_ID,
#   OWNER_NAME, BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY, PORT
#
FROM node:22-alpine AS web

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency manifests and install production deps only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy the compiled web server and frontend assets from the builder stage
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# Docker health check — matches the /health endpoint in Express
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]

# ─── Stage 3: Worker image ────────────────────────────────────────────────────
#
# This image runs the background worker process (streak reminders, due-date
# reminders). Deploy as a separate ECS task / sidecar / Kubernetes Job.
#
# It shares the same production dependencies as the web server image but runs
# dist/worker.js instead of dist/index.js. No HTTP port is exposed.
#
# Runtime environment variables (same set as the web server):
#   DATABASE_URL, JWT_SECRET, BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY
#
FROM node:22-alpine AS worker

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy only the worker bundle from the builder stage
COPY --from=builder /app/dist/worker.js ./dist/worker.js

ENV NODE_ENV=production

# Graceful shutdown: Docker sends SIGTERM before SIGKILL.
# The worker entry point handles SIGTERM and waits for in-flight jobs.
STOPSIGNAL SIGTERM

CMD ["node", "dist/worker.js"]
