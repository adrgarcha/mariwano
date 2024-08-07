import { youtube, youtube_v3 } from '@googleapis/youtube';

const youtubeClient = youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

export async function fetchYoutubeChannelUploads(channelId: string): Promise<youtube_v3.Schema$PlaylistItem[] | undefined> {
   try {
      const channel = await youtubeClient.channels.list({ part: ['contentDetails'], id: [channelId] });
      const uploads = await youtubeClient.playlistItems.list({
         part: ['snippet', 'contentDetails'],
         playlistId: channel.data?.items![0]?.contentDetails?.relatedPlaylists?.uploads,
         maxResults: 1,
      });
      return uploads.data.items;
   } catch (error) {
      console.error(`Hubo un error al obtener los videos del canal: ${error}`);
      return;
   }
}
