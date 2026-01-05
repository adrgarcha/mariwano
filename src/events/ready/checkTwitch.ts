import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { TwitchNotificationConfig } from '../../models/TwitchNotificationConfig';
import { getTwitchChannelStream } from '../../lib/twitch';

// Production: every 60 seconds -> '* * * * *'
// Development: every 10 seconds -> '*/10 * * * * *'
const cronExpression = process.env.NODE_ENV === 'production' ? '* * * * *' : '*/10 * * * * *';

export default function (client: Client) {
   cron.schedule(cronExpression, () => checkTwitchStreams(client), { timezone: 'Europe/Madrid' });
}

async function checkTwitchStreams(client: Client) {
   try {
      const notificationConfigs = await TwitchNotificationConfig.find();
      for (const notificationConfig of notificationConfigs) {
         const stream = await getTwitchChannelStream(notificationConfig.twitchChannelName);

         const wasLive = notificationConfig.isLive;
         const isCurrentlyLive = stream !== null;

         if (isCurrentlyLive && !wasLive) {
            const cachedGuild = client.guilds.cache.get(notificationConfig.guildId);
            if (!cachedGuild) continue;

            const targetChannel = cachedGuild.channels.cache.get(notificationConfig.notificationChannelId) as TextChannel;
            if (!targetChannel) {
               console.error(`No se ha encontrado el canal de notificaciones con ID ${notificationConfig.notificationChannelId}`);
               continue;
            }

            const streamTitle = stream.title;
            const streamGame = stream.gameName;
            const streamUrl = `https://www.twitch.tv/${notificationConfig.twitchChannelName}`;
            const streamerName = stream.userDisplayName;
            const thumbnailUrl = stream.getThumbnailUrl(1280, 720);

            notificationConfig.isLive = true;
            notificationConfig.lastStreamId = stream.id;

            await notificationConfig.save();

            const targetMessage =
               notificationConfig.customMessage
                  ?.replace('{streamUrl}', streamUrl)
                  ?.replace('{streamTitle}', streamTitle)
                  ?.replace('{streamerName}', streamerName)
                  ?.replace('{gameName}', streamGame || 'Sin categoría')
                  ?.replace('{thumbnailUrl}', thumbnailUrl) ||
               `🔴 **${streamerName}** está en directo!\n**${streamTitle}**\nJugando a: ${streamGame || 'Sin categoría'}\n${streamUrl}`;

            await targetChannel.send(targetMessage);
         } else if (!isCurrentlyLive && wasLive) {
            notificationConfig.isLive = false;
            await notificationConfig.save();
         }
      }
   } catch (error) {
      console.error(`Hubo un error al comprobar los streams de Twitch: ${error}`);
   }
}
