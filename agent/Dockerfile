# Dockerfile for LiveKit Agent
FROM node:20-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files from parent directory
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy the entire agent directory
COPY agent/ ./agent/

# Copy tsconfig from parent
COPY tsconfig.json ./

# Download model files
RUN npx tsx agent/agent.ts download-files

# Set environment
ENV NODE_ENV=production

# Run the agent
CMD ["npx", "tsx", "agent/agent.ts", "start"]
