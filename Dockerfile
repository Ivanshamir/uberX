FROM node:23.7.0-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies)
RUN pnpm install

# Copy source code and config files
COPY tsconfig.json ./
COPY src/ ./src/
COPY .env ./

# Add build and start script
CMD ["sh", "-c", "pnpm build && node dist/index.js"]