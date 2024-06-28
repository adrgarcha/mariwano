import { Client, Message } from 'discord.js';
import { Level } from '../../models/Level';
import { calculateLevelXp } from '../../utils/calculateLevelXp';

const cooldowns = new Set();

function getRandomXp(min: number, max: number): number {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function (message: Message, client: Client) {
   if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

   const xpToGive = getRandomXp(5, 15);

   const query = {
      userId: message.author.id,
      guildId: message.guild.id,
   };

   try {
      const level = await Level.findOne(query);

      if (level) {
         level.xp += xpToGive;

         if (level.xp > calculateLevelXp(level.level)) {
            level.xp = 0;
            level.level += 1;

            message.channel.send(`${message.member} ha fumado lo suficiente como para subir al nivel ${level.level}.`);
         }

         await level.save().catch(e => {
            console.log(`Error al guardar el nivel actualizado: ${e}`);
            return;
         });

         cooldowns.add(message.author.id);
         setTimeout(() => {
            cooldowns.delete(message.author.id);
         }, 30000); // 30s
      } else {
         const newLevel = new Level({
            userId: message.author.id,
            guildId: message.guild.id,
            xp: xpToGive,
         });

         await newLevel.save();

         cooldowns.add(message.author.id);
         setTimeout(() => {
            cooldowns.delete(message.author.id);
         }, 30000); // 30s
      }
   } catch (error) {
      console.log(`Hubo un error al dar la experiencia: ${error}`);
   }
}
