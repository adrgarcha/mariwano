import { BaseExtractor, Track, Playlist, Util, ExtractorInfo, ExtractorSearchContext, ExtractorStreamable, TrackSource } from 'discord-player';
import type { Readable } from 'stream';
import { createSabrStream } from './youtubeSabrCore';
import { createLivestream } from './youtubeLivesHandler';
import { getInnertube } from './getInnertube';

export interface YoutubeSabrExtractorOptions {
   cookies?: string;
   logSabrEvents?: boolean;
   createStream?: (extractor: YoutubeSabrExtractor, track: Track) => Promise<Readable | string>;
}

function isUrl(input: string): boolean {
   try {
      const url = new URL(input);
      return ['https:', 'http:'].includes(url.protocol);
   } catch {
      return false;
   }
}

function extractVideoId(vid: string): string | null {
   const YOUTUBE_REGEX = /^https:\/\/(www\.)?youtu(\.be\/.{11}(.+)?|be\.com\/watch\?v=.{11}(&.+)?|be\.com\/live\/.{11}(.+)?)/;
   if (!YOUTUBE_REGEX.test(vid)) throw new Error('Invalid youtube url');

   let id = new URL(vid).searchParams.get('v');

   if (!id) {
      const pathMatch = vid.split('/').at(-1)?.split('?').at(0);
      if (pathMatch && pathMatch.length === 11) id = pathMatch;
   }

   return id;
}

type VideoNode = {
   type: string;
   id: string;
   thumbnails: Array<{ url: string }>;
};

type PlaylistVideoNode = {
   type: string;
   id: string;
   title: { text?: string };
   duration: { seconds: number };
   thumbnails: Array<{ url: string }>;
   author: { name: string };
   is_live: boolean;
};

type PlaylistRaw = {
   info: { title?: string; thumbnails: Array<{ url: string }>; description?: string; author: { name?: string; url?: string } };
   channels: Array<{ author?: { name?: string; url?: string } }>;
   videos: PlaylistVideoNode[];
   has_continuation: boolean;
   getContinuation: () => Promise<PlaylistRaw>;
};

export class YoutubeSabrExtractor extends BaseExtractor<YoutubeSabrExtractorOptions> {
   static identifier = 'com.itsmaat.discord-player.youtube-sabr';

   cookies?: string;
   logSabrEvents = true;
   innertube: Awaited<ReturnType<typeof getInnertube>> | null = null;
   declare _stream: ((track: Track) => Promise<ExtractorStreamable>) | null;

   async activate(): Promise<void> {
      this.protocols = ['sabr'];
      this.cookies = this.options.cookies;
      this.logSabrEvents = this.options.logSabrEvents ?? true;
      this.innertube = await getInnertube(this.cookies);

      const fn = this.options.createStream;
      if (typeof fn === 'function') {
         this._stream = (q: Track) => fn(this, q);
      }
   }

   async deactivate(): Promise<void> {
      this._stream = null;
      this.innertube = null;
   }

   async validate(query: string): Promise<boolean> {
      if (typeof query !== 'string') return false;
      return !isUrl(query) || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(query);
   }

   async handle(query: string, context: ExtractorSearchContext): Promise<ExtractorInfo> {
      const player = this.context.player;

      try {
         if (!isUrl(query)) {
            const search = await this.innertube!.search(query);
            const videos = (search.videos as unknown as VideoNode[]).filter(v => v.type === 'Video');
            const tracks: Track[] = [];

            for (const video of videos.slice(0, 10)) {
               const info = await this.innertube!.getBasicInfo(video.id);
               const durationMs = (info.basic_info?.duration ?? 0) * 1000;

               tracks.push(
                  new Track(player, {
                     title: info.basic_info?.title ?? `YouTube:${video.id}`,
                     author: info.basic_info?.author ?? undefined,
                     url: `https://www.youtube.com/watch?v=${video.id}`,
                     thumbnail: video.thumbnails[0]?.url,
                     duration: Util.buildTimeCode(Util.parseMS(durationMs)),
                     source: 'youtube' as TrackSource,
                     requestedBy: context.requestedBy ?? undefined,
                     raw: {
                        basicInfo: info,
                        live: info.basic_info?.is_live ?? false,
                     },
                  })
               );
            }

            return this.createResponse(null, tracks);
         }

         const urlObj = new URL(query);
         const hasList = urlObj.searchParams.has('list') && !urlObj.searchParams.has('v');
         const isShortLink = /(^|\.)youtu\.be$/i.test(urlObj.hostname);
         const isPlaylist = hasList && !isShortLink;
         const playlistId = isPlaylist ? urlObj.searchParams.get('list') : null;

         if (isPlaylist && playlistId) {
            let playlist = (await this.innertube!.getPlaylist(playlistId)) as unknown as PlaylistRaw;
            if (!playlist?.videos?.length) return this.createResponse(null, []);

            const dpPlaylist = new Playlist(player, {
               id: playlistId,
               title: playlist.info.title ?? 'Unknown',
               url: query,
               thumbnail: playlist.info.thumbnails[0].url,
               description: playlist.info.description ?? playlist.info.title ?? 'UNKNOWN DESCRIPTION',
               source: 'youtube' as TrackSource,
               type: 'playlist',
               author: {
                  name: playlist.channels[0]?.author?.name ?? playlist.info.author.name ?? 'UNKNOWN AUTHOR',
                  url: playlist.channels[0]?.author?.url ?? playlist.info.author.url ?? 'UNKNOWN AUTHOR',
               },
               tracks: [],
            });

            const mapPlaylistVideo = (v: PlaylistVideoNode): Track => {
               const duration = Util.buildTimeCode(Util.parseMS(v.duration.seconds * 1000));
               const raw = { duration_ms: v.duration.seconds * 1000, live: v.is_live, duration };

               return new Track(player, {
                  title: v.title.text ?? 'UNKNOWN TITLE',
                  duration,
                  thumbnail: v.thumbnails[0]?.url,
                  author: v.author.name,
                  requestedBy: context.requestedBy ?? undefined,
                  url: `https://youtube.com/watch?v=${v.id}`,
                  raw,
                  playlist: dpPlaylist,
                  source: 'youtube' as TrackSource,
                  queryType: 'youtubeVideo',
               });
            };

            const plTracks = playlist.videos.filter(v => v.type === 'PlaylistVideo').map(mapPlaylistVideo);

            while (playlist.has_continuation) {
               playlist = await playlist.getContinuation();
               plTracks.push(...playlist.videos.filter(v => v.type === 'PlaylistVideo').map(mapPlaylistVideo));
            }

            dpPlaylist.tracks = plTracks;
            return this.createResponse(dpPlaylist, plTracks);
         }

         const videoId = extractVideoId(query);
         if (!videoId) return this.createResponse(null, []);

         const info = await this.innertube!.getInfo(videoId);
         const durationMs = (info.basic_info?.duration ?? 0) * 1000;
         const isLive = info.basic_info?.is_live || (info as unknown as { live_status?: string }).live_status === 'LIVE';

         const trackObj = new Track(player, {
            title: info.basic_info?.title ?? `YouTube:${videoId}`,
            author: info.basic_info?.author ?? undefined,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: info.basic_info?.thumbnail?.[0]?.url,
            duration: Util.buildTimeCode(Util.parseMS(durationMs)),
            source: 'youtube' as TrackSource,
            requestedBy: context.requestedBy ?? undefined,
            raw: {
               basicInfo: info,
               live: isLive,
               liveStatus: (info as unknown as { live_status?: string }).live_status,
            },
         });

         return this.createResponse(null, [trackObj]);
      } catch (err) {
         console.error('[YoutubeSabrExtractor handle error]', err);
         return this.createResponse(null, []);
      }
   }

   async stream(track: Track): Promise<ExtractorStreamable> {
      if (!this.innertube) throw new Error('Innertube not initialized; call activate() first');

      const videoId = extractVideoId(track.url || (track.raw as { id?: string })?.id || '');
      if (!videoId) throw new Error('Unable to extract video id from track.url');

      const raw = track.raw as { live?: boolean; liveStatus?: string };
      const isLive = raw?.live || raw?.liveStatus === 'LIVE';

      if (isLive) {
         if (this.logSabrEvents) console.log(`[Extractor] Detected livestream, using DASH handler for ${videoId}`);
         return await createLivestream(videoId, this.cookies, this.logSabrEvents);
      }

      if (this.logSabrEvents) console.log(`[Extractor] Using SABR handler for ${videoId}`);
      return await createSabrStream(videoId, this.cookies, this.logSabrEvents);
   }
}
