# Frontend Dockerfile for Next.js development
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Expose Next.js default port
EXPOSE 3000

# Install dependencies and start dev server
# This ensures node_modules is always up to date even with volume mounts
CMD npm install && npm run dev
