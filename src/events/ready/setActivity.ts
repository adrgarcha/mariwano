import { Client } from 'discord.js';
import { ActivityType } from 'discord.js';

module.exports = (client: Client) => {
   const strArr = ['peta', 'matujo', 'hanselygretel', 'canuto', 'hoogie doogie', 'clencho', 'petoncio', 'leño', 'troncho'];
   client.user?.setActivity({
      name: `un buen ${strArr[Math.floor(Math.random() * strArr.length)]}`,
      type: ActivityType.Playing,
   });
};
