import { Client, TextChannel } from 'discord.js';
import { TwitchNotificationConfig } from '../../models/TwitchNotificationConfig';
import { getTwitchChannelStream } from '../../lib/twitch';

export default function (client: Client) {
   const checkTwitch = async () => {
      try {
         const notificationConfigs = await TwitchNotificationConfig.find();

         for (const notificationConfig of notificationConfigs) {
            const stream = await getTwitchChannelStream(notificationConfig.twitchChannelName);

            const wasLive = notificationConfig.isLive;
            const isCurrentlyLive = stream !== null;

            if (isCurrentlyLive && !wasLive) {
               const targetGuild = await client.guilds.fetch(notificationConfig.guildId);

               if (!targetGuild) {
                  await TwitchNotificationConfig.findOneAndDelete({ _id: notificationConfig._id });
                  continue;
               }

               const targetChannel = (await targetGuild.channels.fetch(notificationConfig.notificationChannelId)) as TextChannel;

               if (!targetChannel) {
                  await TwitchNotificationConfig.findOneAndDelete({ _id: notificationConfig._id });
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
   };

   checkTwitch();
   setInterval(checkTwitch, 60000);
}
