FROM node:18-alpine AS builder

# Add labels
LABEL org.opencontainers.image.title="Siam Inline Super League Scoreboard"
LABEL org.opencontainers.image.description="Real-time hockey scoreboard overlay for OBS"
LABEL org.opencontainers.image.vendor="Siam Inline Super League"

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs && chmod 755 logs

FROM node:18-alpine

# Create a non-root user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Create app directory and set proper ownership
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/server /app/server
COPY --from=builder --chown=nodejs:nodejs /app/overlay /app/overlay
COPY --from=builder --chown=nodejs:nodejs /app/controller /app/controller
COPY --from=builder --chown=nodejs:nodejs /app/index.html /app/
COPY --from=builder --chown=nodejs:nodejs /app/package*.json /app/
COPY --from=builder --chown=nodejs:nodejs /app/logs /app/logs

# Set the environment variables with build args support
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PORT=3000

# Set NODE_ENV to production for better performance
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --spider -q http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"] 