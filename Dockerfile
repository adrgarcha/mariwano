# Using Node v18
FROM node:18

# Install npm dependencies and ffmpeg
RUN apt-get update && apt-get install -y python3 make build-essential ffmpeg

# Set the work directory
WORKDIR /mariwano-discord-bot

# Copy the source files into the image
COPY package*.json ./
COPY . ./src/

# Install dependencies from package-lock.json
RUN npm ci

# Listen to the port 8080
EXPOSE 8080

# Startup command to run the bot
CMD node .