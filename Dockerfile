# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

# Install production dependencies only
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ============================================
# STAGE 2: Builder  
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ============================================
# STAGE 3: Production
# ============================================
FROM node:20-alpine AS production

# Install security updates
RUN apk --no-cache upgrade && \
    apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY --chown=nestjs:nodejs package*.json ./

# Copy production dependencies from dependencies stage
COPY --chown=nestjs:nodejs --from=dependencies /app/node_modules ./node_modules

# Copy Prisma files
COPY --chown=nestjs:nodejs prisma ./prisma/
COPY --chown=nestjs:nodejs prisma.config.ts ./

# Copy generated Prisma Client
COPY --chown=nestjs:nodejs --from=builder /app/generated ./generated

# Copy built application from builder stage
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist

# Set user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "dist/main"]
