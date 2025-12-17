# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Install dependencies needed for Tauri
RUN apk add --no-cache \
    curl \
    wget \
    rust \
    cargo \
    python3 \
    make \
    g++ \
    linux-headers \
    libgcc \
    libstdc++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src-tauri/Cargo.toml ./src-tauri/
COPY src-tauri/Cargo.lock ./src-tauri/

# Install all npm dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
