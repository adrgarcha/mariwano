import { Collection } from 'discord.js';
import { CustomClient } from '../lib/types';
import { readFiles } from '../utils/readFiles';

export async function commandHandler(client: CustomClient) {
   client.commands = new Collection();
   await readFiles('../commands', ({ filePath, obj: command }) => {
      if ('data' in command && 'run' in command) {
         client.commands.set(command.data.name, command);
      } else {
         console.log(`El comando en ${filePath} le falta una de las propiedades "data" or "run".`);
      }
   });
}
