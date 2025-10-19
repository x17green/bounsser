# Production Dockerfile for Bouncer Backend
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for building
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsc-alias.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --only=production=false

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Build the application
RUN npm run build

# Remove dev dependencies and clean npm cache
RUN npm prune --production && \
    npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install system dependencies for production
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bouncer -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=bouncer:nodejs /app/dist ./dist/
COPY --from=builder --chown=bouncer:nodejs /app/node_modules ./node_modules/
COPY --from=builder --chown=bouncer:nodejs /app/package*.json ./
COPY --from=builder --chown=bouncer:nodejs /app/prisma ./prisma/

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R bouncer:nodejs /app/logs

# Switch to non-root user
USER bouncer

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/core/server.js"]
