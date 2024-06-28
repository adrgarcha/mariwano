import { Client, Message } from 'discord.js';

export const botReply = (message: Message, client: Client) => {
   if (message.author.bot) return;

   if (message.content === 'iyow') {
      message.reply('ke paza iyow');
   }

   if (message.content.includes('sale evento')) {
      message.reply('el de mis huevos al viento');
   }
};
