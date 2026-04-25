import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import cron from 'node-cron';
import { AnonMessageModel } from '../../models/AnonMessage';
import { AnonConfigModel } from '../../models/AnonConfig';

// Production: every Sunday at 21:00 -> '0 21 * * 0'
// Development: every minute -> '* * * * *'
const cronExpression = process.env.NODE_ENV === 'production' ? '0 21 * * 0' : '* * * * *';

export default function (client: Client) {
   cron.schedule(cronExpression, () => collectMessages(client), { timezone: 'Europe/Madrid' });
}

async function collectMessages(client: Client) {
   try {
      const AnonMessages = await AnonConfigModel.find();
      const AnonMessage = await AnonMessageModel.find();
      for (const message of AnonMessage) {
         const cachedGuild = client.guilds.cache.get(message.guildId);
         if (!cachedGuild) continue;

         const targetChannel = cachedGuild.channels.cache.get(message.anonChannelGuild) as TextChannel;
         if (!targetChannel) {
            console.error(`No se ha encontrado el canal de mensajes anónimos con ID ${message.anonChannelGuild}`);
            continue;
         }

         await collectAll(targetChannel, new Date());
         await message.updateOne({ published: true });
      }
   } catch (error) {
      console.error(`Hubo un error en el evento de ranking de memes: ${error}`);
   }
}

async function collectAll(targetChannel: TextChannel, cutoffDate: Date) {
   const anonMessages = new Array<string>();
   const leaderboardEmbed = new EmbedBuilder().setTitle('👤 **MENSAJES ANÓNIMOS** 👤').setColor(0x47d6fd);

   try {
      const messages = await AnonMessageModel.find({
         content: { $ne: '' },
         date: { $lt: cutoffDate },
      });
      anonMessages.push(...messages.map(message => message.content));
   } catch (error) {
      console.error(`Hubo un error al recopilar los mensajes anónimos: ${error}`);
      return;
   }

   if (anonMessages.length < 3) {
      leaderboardEmbed.setDescription('No se han enviado suficientes mensajes anónimos.');
      targetChannel.send({ embeds: [leaderboardEmbed] });
      return;
   }

   leaderboardEmbed
      .setDescription(anonMessages.map(message => `🗣: ${message}`).join('\n'))

      .setFooter({
         text: `Los autores de los mensajes son totalmente anónimos (excepto para el admin por supuesto).`,
      });

   targetChannel.send({ embeds: [leaderboardEmbed] });
   AnonConfigModel.deleteMany({});
}
