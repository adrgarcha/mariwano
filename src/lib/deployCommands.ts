import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import { readFiles } from '../utils/readFiles';

export async function deployCommands(botToken: string, botId: string) {
   const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
   await readFiles('../commands', ({ filePath, obj: command }) => {
      if ('data' in command && 'run' in command) {
         commands.push(command.data.toJSON());
      } else {
         console.log(`El comando en ${filePath} le falta una de las propiedades "data" or "run".`);
      }
   });

   const rest = new REST().setToken(botToken);

   (async () => {
      try {
         const data = (await rest.put(Routes.applicationCommands(botId), { body: commands })) as [];

         if (data.length > 0) console.log(`Se han actualizado ${data.length} comandos.`);
      } catch (error) {
         console.error(error);
      }
   })();
}
