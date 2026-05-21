import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import cron from 'node-cron';
import { AnonMessage } from '../../models/AnonMessage';
import { AnonChannelConfig } from '../../models/AnonChannelConfig';

const cronExpression = process.env.NODE_ENV === 'production' ? '0 21 * * 0' : '* * * * *';

export default function (client: Client) {
   cron.schedule(cronExpression, () => sendAnonMessages(client), { timezone: 'Europe/Madrid' });
}

async function sendAnonMessages(client: Client) {
   try {
      const configs = await AnonChannelConfig.find();

      for (const config of configs) {
         const guild = client.guilds.cache.get(config.guildId);
         if (!guild) continue;

         const channel = guild.channels.cache.get(config.channelId) as TextChannel;
         if (!channel) {
            console.error(`Canal no encontrado para servidor ${config.guildId}`);
            continue;
         }

         const messages = await AnonMessage.find({ guildId: config.guildId });

         if (messages.length < 3) {
            const embed = new EmbedBuilder()
               .setTitle('👤 **MENSAJES ANÓNIMOS** 👤')
               .setDescription('No se han enviado suficientes mensajes anónimos.')
               .setColor(0x47d6fd);
            await channel.send({ embeds: [embed] });
            continue;
         }

         const embed = new EmbedBuilder()
            .setTitle('👤 **MENSAJES ANÓNIMOS** 👤')
            .setDescription(messages.map(msg => `🗣: ${msg.content}`).join('\n'))
            .setColor(0x47d6fd)
            .setFooter({
               text: 'Los autores de los mensajes son totalmente anónimos (excepto para el admin).',
            });

         await channel.send({ embeds: [embed] });

         await AnonMessage.deleteMany({ guildId: config.guildId });
      }
   } catch (error) {
      console.error('Error en el manejador de mensajes anónimos:', error);
   }
}
