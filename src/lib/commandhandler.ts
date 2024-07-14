import path from "path";
import fs from "node:fs";
import {
  ChatInputCommandInteraction,
  Collection,
  Events,
  Interaction,
  Client,
  ApplicationCommandData,
} from "discord.js";

export class CustomClient extends Client {
  commands: Collection<string, ApplicationCommandData> = new Collection();
}

export const commandHandler = (client: CustomClient) => {
  const foldersPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file: string) => file.endsWith(".ts"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "run" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
};
