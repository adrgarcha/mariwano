import { Client } from 'discord.js';
import { readFiles } from '../utils/readFiles';

export function eventHandler(client: Client) {
   readFiles('../events', ({ folderName, filePath, obj: event }) => {
      if ('default' in event) {
         client.on(folderName, (...args: any) => event.default(...args));
      } else {
         console.log(`El evento en ${filePath} le falta la funcion por defecto.`);
      }
   });
}
