# Multi-stage build for React/Vite Annotator Application

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user for build process
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Change ownership of the working directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Copy package files for dependency caching
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile for reproducible builds
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build the application for production
RUN pnpm run build

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache curl dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user for nginx
RUN addgroup -g 101 -S nginx-app && \
    adduser -S nginx-app -u 101 -G nginx-app

# Remove default nginx configuration and content
RUN rm -rf /usr/share/nginx/html/* && \
    rm -rf /etc/nginx/conf.d/*

# Copy built application from builder stage
COPY --from=builder --chown=nginx-app:nginx-app /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx-app:nginx-app nginx.conf /etc/nginx/nginx.conf

# Create nginx cache and log directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-app:nginx-app /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Switch to non-root user
USER nginx-app

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Development stage
FROM node:20-alpine AS development

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init git && \
    rm -rf /var/cache/apk/*

# Create non-root user for development
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Change ownership of the working directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Copy package files for dependency caching
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml ./

# Install dependencies including dev dependencies
RUN pnpm install --prefer-offline

# Copy source code (this will be overridden by volume mounts in development)
COPY --chown=nextjs:nodejs . .

# Expose Vite dev server port
EXPOSE 5173

# Health check for development server
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start development server with hot reloading
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]
