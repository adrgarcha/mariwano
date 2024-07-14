import { Collection, REST, Routes } from "discord.js";
import path from "path";
import fs from "node:fs";

import "dotenv/config";

export const deploycommands = (client: any) => {
  const commands = [];

  // Grab all the command folders from the commands directory you created earlier
  const foldersPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file: string) => file.endsWith(".ts"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "run" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(process.env.DISCORD_TEST_TOKEN!);

  // and deploy your commands!
  (async () => {
    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      // The put method is used to fully refresh all commands in the guild with the current set

      /*DESPLIEGUE*/
      /*
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID!),
			{ body: commands },
		);
		*/

      /*TESTING*/

      const data = await rest.put(
        Routes.applicationCommands(process.env.APPLICATION_ID!),
        { body: commands }
      );

      console.log(
        `Successfully reloaded nosecuantos application (/) commands.`
      );
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
};
