# Using official Bun image
# See all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install ffmpeg runtime dependency
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

# Install dependencies into temp directory for better caching
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Final release image
FROM base AS release

# Copy production dependencies
COPY --from=install /temp/prod/node_modules node_modules

# Copy application source code
COPY . .

# Switch to the non-root bun user (provided by the official image)
USER bun

# Startup command to run the bot
CMD ["bun", "start:prod"]
