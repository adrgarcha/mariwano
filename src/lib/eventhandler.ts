import path from "path";
import fs from "node:fs";
import {
  ChatInputCommandInteraction,
  Collection,
  Events,
  REST,
  Routes,
} from "discord.js";
import "dotenv/config";

export const eventHandler = (client: any) => {
  const eventsPath = path.join(__dirname, "../events");
  const eventFolder = fs.readdirSync(eventsPath);

  for (const folder of eventFolder) {
    const commandsPath = path.join(eventsPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file: string) => file.endsWith(".ts"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const event = require(filePath);

      client.on(folder, (...args: any) => event.default(...args));
    }
  }
};
