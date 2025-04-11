# Using Node LTS Alpine for smaller image size
FROM node:lts-alpine

# Install only runtime dependencies (ffmpeg) and clean up
RUN apk add --no-cache ffmpeg

# Set the work directory
WORKDIR /mariwano-discord-bot

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Change ownership to the non-root user
RUN chown -R appuser:appgroup /mariwano-discord-bot

# Switch to the non-root user
USER appuser

# Startup command to run the bot
CMD ["npm", "run", "start:prod"]