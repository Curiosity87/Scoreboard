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
    RUN npm install --omit=dev
    
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
    COPY --from=builder --chown=nodejs:nodejs /app/assets /app/assets
    
    # Environment configuration
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV SUPABASE_URL=https://xaakqhceogyxvcccstav.supabase.co
    ENV SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWtxaGNlb2d5eHZjY2NzdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzksImV4cCI6MjA2MDU0MDQ3OX0.ALvUeCFh6dN8V1YCoDHhsue8-Gx13Z8OMLblH2DQuNg
    
    # Expose app port
    EXPOSE 3000
    
    # Switch to non-root user
    USER nodejs
    
    # Health check to ensure app is running
    HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --spider -q http://localhost:3000 || exit 1
    
    # Start the app
    CMD ["npm", "start"]
    