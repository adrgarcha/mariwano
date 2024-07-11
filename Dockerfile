# Using Node LTS
FROM node:lts

# Install npm dependencies and ffmpeg
RUN apt-get update && apt-get install -y python3 make build-essential ffmpeg

# Set the work directory
WORKDIR /mariwano-discord-bot

# Copy the source files into the image
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm ci

# Startup command to run the bot
CMD ["npm", "start"]