FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@10.18.2 && \
    pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "src-js/server.js"]

