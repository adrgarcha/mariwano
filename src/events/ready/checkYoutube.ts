import Parser from 'rss-parser';
import { NotificationConfig } from '../../models/NotificationConfig';
import { Client, TextChannel } from 'discord.js';

const parser = new Parser();

export default function (client: Client) {
   const checkYoutube = async () => {
      try {
         const notificationConfigs = await NotificationConfig.find();

         for (const notificationConfig of notificationConfigs) {
            const youtubeRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${notificationConfig.youtubeChannelId}`;
            const feed = await parser.parseURL(youtubeRssUrl).catch(error => console.error(`Hubo un error al obtener el feed de YouTube: ${error}`));

            if (!feed?.items.length) continue;

            const lastVideo = feed.items[0];
            const lastCheckedVideo = notificationConfig.lastCheckedVideo;

            if (
               !lastCheckedVideo ||
               (lastVideo.id.split(':')[2] !== lastCheckedVideo.videoId && new Date(lastVideo.pubDate!) > new Date(lastCheckedVideo.publishedDate))
            ) {
               const targetGuild = await client.guilds.fetch(notificationConfig.guildId);

               if (!targetGuild) {
                  await NotificationConfig.findOneAndDelete({ _id: notificationConfig._id });
                  continue;
               }

               const targetChannel = (await targetGuild.channels.fetch(notificationConfig.notificationChannelId)) as TextChannel;

               if (!targetChannel) {
                  await NotificationConfig.findOneAndDelete({ _id: notificationConfig._id });
                  continue;
               }

               notificationConfig.lastCheckedVideo = {
                  videoId: lastVideo.id.split(':')[2],
                  publishedDate: new Date(lastVideo.pubDate!),
               };

               notificationConfig
                  .save()
                  .then(async () => {
                     const targetMessage =
                        notificationConfig.customMessage
                           ?.replace('{videoUrl}', lastVideo.link!)
                           ?.replace('{videoTitle}', lastVideo.title!)
                           ?.replace('{channelName}', feed.title!)
                           ?.replace('{channelUrl}', feed.link!) || `Nuevo video de **${feed.title}**: ${lastVideo.link}`;

                     await targetChannel.send(targetMessage);
                  })
                  .catch(error => null);
            }
         }
      } catch (error) {
         console.error(`Hubo un error al comprobar el feed de YouTube: ${error}`);
      }
   };

   checkYoutube();
   setInterval(checkYoutube, 60000);
}
