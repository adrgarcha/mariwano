import { Client, TextChannel } from 'discord.js';
import { NotificationConfig } from '../../models/NotificationConfig';
import { fetchYoutubeChannelUploads } from '../../utils/fetchYoutube';

export default function (client: Client) {
   const checkYoutube = async () => {
      try {
         const notificationConfigs = await NotificationConfig.find();

         for (const notificationConfig of notificationConfigs) {
            const uploads = await fetchYoutubeChannelUploads(notificationConfig.youtubeChannelId);

            if (!uploads?.length) continue;

            const lastVideo = uploads[0];
            const lastCheckedVideo = notificationConfig.lastCheckedVideo;

            const lastVideoId = lastVideo.contentDetails?.videoId!;
            const lastVideoPubDate = new Date(lastVideo.contentDetails?.videoPublishedAt!);
            const lastVideoLink = `https://www.youtube.com/watch?v=${lastVideoId}`;
            const lastVideoTitle = lastVideo.snippet?.title!;
            const lastVideoChannelName = lastVideo.snippet?.channelTitle!;
            const lastVideoChannelUrl = `https://www.youtube.com/channel/${lastVideo.snippet?.channelId}`;

            if (!lastCheckedVideo || (lastVideoId !== lastCheckedVideo.videoId && lastVideoPubDate > new Date(lastCheckedVideo.publishedDate))) {
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
                  videoId: lastVideoId,
                  publishedDate: lastVideoPubDate,
               };

               notificationConfig
                  .save()
                  .then(async () => {
                     const targetMessage =
                        notificationConfig.customMessage
                           ?.replace('{videoUrl}', lastVideoLink)
                           ?.replace('{videoTitle}', lastVideoTitle)
                           ?.replace('{channelName}', lastVideoChannelName)
                           ?.replace('{channelUrl}', lastVideoChannelUrl) || `Nuevo video de **${lastVideoChannelName}**: ${lastVideoLink}`;

                     await targetChannel.send(targetMessage);
                  })
                  .catch(error => console.error(`Hubo un error al guardar la configuración de notificación: ${error}`));
            }
         }
      } catch (error) {
         console.error(`Hubo un error al comprobar el feed de YouTube: ${error}`);
      }
   };

   checkYoutube();
   setInterval(checkYoutube, 60000);
}
