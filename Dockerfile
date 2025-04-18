# ---------- Build Stage ----------
    FROM node:18-alpine AS builder

    LABEL org.opencontainers.image.title="Siam Inline Super League Scoreboard"
    LABEL org.opencontainers.image.description="Real-time hockey scoreboard overlay for OBS"
    LABEL org.opencontainers.image.vendor="Siam Inline Super League"
    
    # Set working directory
    WORKDIR /app
    
    # Copy package files first for cache efficiency
    COPY package*.json ./
    
    # Install dependencies without devDependencies
    RUN npm ci --omit=dev
    
    # Copy application source code
    COPY . .
    
    # Create logs directory with proper permissions
    RUN mkdir -p logs && chmod 755 logs
    
    # ---------- Production Stage ----------
    FROM node:18-alpine
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs && \
        adduser -S nodejs -u 1001 -G nodejs
    
    # Set working directory
    WORKDIR /app
    
    # Copy only the necessary files from the builder stage
    COPY --from=builder --chown=nodejs:nodejs /app/node_modules /app/node_modules
    COPY --from=builder --chown=nodejs:nodejs /app/server /app/server
    COPY --from=builder --chown=nodejs:nodejs /app/overlay /app/overlay
    COPY --from=builder --chown=nodejs:nodejs /app/controller /app/controller
    COPY --from=builder --chown=nodejs:nodejs /app/index.html /app/
    COPY --from=builder --chown=nodejs:nodejs /app/package*.json /app/
    COPY --from=builder --chown=nodejs:nodejs /app/logs /app/logs
    
    # Environment configuration
    ARG NODE_ENV=production
    ENV NODE_ENV=$NODE_ENV
    ENV PORT=3000
    
    # Expose app port
    EXPOSE 3000
    
    # Switch to non-root user
    USER nodejs
    
    # Health check to ensure app is running
    HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --spider -q http://localhost:3000 || exit 1
    
    # Start the app
    CMD ["npm", "start"]
    