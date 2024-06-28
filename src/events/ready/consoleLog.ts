import { Client } from 'discord.js';

export const consoleLog = (client: Client) => {
   console.log(`🚬 ${client.user?.username} esta fumando.`);
};
