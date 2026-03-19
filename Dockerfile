# ════════════════════════════════════════
#  Stage 1 — builder
#  Install ALL deps and run tests here
# ════════════════════════════════════════
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first — Docker caches this layer
# If package.json hasn't changed, npm ci is skipped on rebuild
COPY package*.json ./

# npm ci = clean install, faster, reproducible (uses package-lock.json)
RUN npm ci

# Copy source code
COPY . .


# ════════════════════════════════════════
#  Stage 2 — production
#  Lean final image, no dev dependencies
# ════════════════════════════════════════
FROM node:18-alpine AS production

# Security: never run as root inside containers
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production deps — devDependencies excluded
RUN npm ci --only=production

# Copy only the src folder from builder stage (not tests, not node_modules)
COPY --from=builder /app/src ./src

# Switch to non-root user
USER appuser

# Document the port (doesn't publish it — that happens at docker run)
EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/app.js"]


