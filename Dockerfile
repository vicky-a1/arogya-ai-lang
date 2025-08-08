# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json .npmrc ./
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm ci --only=production --no-optional --no-audit

# Production stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY public ./public

# Security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S arogya -u 1001 -G nodejs && \
    chown -R arogya:nodejs /app
USER arogya

# Runtime config
ENV PORT=3000
EXPOSE 3000
CMD ["node", "--max-old-space-size=512", "server.js"]

# Change ownership of the app directory
RUN chown -R arogya:nodejs /app
USER arogya

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
