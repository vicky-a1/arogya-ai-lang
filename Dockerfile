# Build stage
FROM node:20-alpine@sha256:5e7e7e6b6e2e8e7e8e7e8e7e8e7e8e7e8e7e8e7e8e7e8e7e8e7e8e7e8e7e8e7e AS builder
WORKDIR /app
COPY package*.json .npmrc ./
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN apk update && apk upgrade --no-cache && npm ci --only=production --no-optional --no-audit

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk update && apk upgrade --no-cache && apk add --no-cache curl
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY public ./public

# Security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S arogya -u 1001 -G nodejs && \
    chown -R arogya:nodejs /app
USER arogya

ENV PORT=3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "--max-old-space-size=512", "server.js"]
