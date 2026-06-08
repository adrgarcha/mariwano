import { YTNodes } from 'youtubei.js';
import { spawn } from 'child_process';
import type { Readable } from 'stream';
import { getWebPoMinter } from './poTokenGenerator';
import { getInnertube } from './getInnertube';

interface FFmpegStreamOptions {
   isUrl?: boolean;
   logEvents?: boolean;
}

function createFFmpegStream(input: string | Readable, { isUrl = false, logEvents = false }: FFmpegStreamOptions = {}): Readable {
   const baseArgs = ['-loglevel', logEvents ? 'info' : 'error', '-fflags', '+genpts+discardcorrupt', '-analyzeduration', '1M', '-probesize', '1M'];

   let inputArgs: string[];

   if (isUrl) {
      inputArgs = [
         '-reconnect',
         '1',
         '-reconnect_streamed',
         '1',
         '-reconnect_delay_max',
         '5',
         '-rw_timeout',
         '15000000',
         '-fflags',
         '+nobuffer',
         '-flags',
         'low_delay',
         '-i',
         input as string,
      ];
   } else {
      inputArgs = ['-use_wallclock_as_timestamps', '1', '-i', 'pipe:0'];
   }

   const outputArgs = [
      '-vn',
      '-af',
      'aresample=async=1:first_pts=0',
      '-c:a',
      'libopus',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-b:a',
      '128k',
      '-f',
      'opus',
      'pipe:1',
   ];

   const ffmpeg = spawn('ffmpeg', [...baseArgs, ...inputArgs, ...outputArgs], {
      stdio: ['pipe', 'pipe', 'pipe'],
   });

   if (!isUrl) (input as Readable).pipe(ffmpeg.stdin!);

   ffmpeg.stderr.on('data', (_d: Buffer) => {
      // if (logEvents) console.log('[FFmpeg]', _d.toString());
   });

   ffmpeg.on('close', (code: number | null) => {
      if (logEvents) console.log(`[FFmpeg] exited with code ${code}`);
   });

   return ffmpeg.stdout!;
}

async function decipherManifestUrl(url: string, player: { decipher: (url: string) => Promise<string> }, poToken: string): Promise<string> {
   const urlObject = new URL(url);

   if (urlObject.searchParams.size > 0) {
      urlObject.searchParams.set('pot', poToken);
      return await player.decipher(urlObject.toString());
   }

   const pathPrefix = '/api/manifest/hls_variant';
   const pathParts = urlObject.pathname
      .replace(pathPrefix, '')
      .split('/')
      .filter(part => part.length > 0);

   urlObject.pathname = pathPrefix;

   for (let i = 0; i + 1 < pathParts.length; i += 2) urlObject.searchParams.set(pathParts[i], decodeURIComponent(pathParts[i + 1]));

   const deciphered = await player.decipher(urlObject.toString());
   const decipheredUrlObject = new URL(deciphered);

   for (const [key, value] of decipheredUrlObject.searchParams) decipheredUrlObject.pathname += `/${key}/${encodeURIComponent(value)}`;

   decipheredUrlObject.search = '';
   decipheredUrlObject.pathname += `/pot/${encodeURIComponent(poToken)}`;

   return decipheredUrlObject.toString();
}

export async function createLivestream(videoId: string, cookies?: string, logEvents = false): Promise<Readable> {
   const innertube = await getInnertube(cookies);
   const player = innertube.session.player as unknown as { decipher: (url: string) => Promise<string>; signature_timestamp?: number } | undefined;

   let accountInfo: unknown;
   try {
      accountInfo = await innertube.account.getInfo();
   } catch {
      accountInfo = null;
   }

   const dataSyncId =
      (
         accountInfo as {
            contents?: {
               contents?: Array<{ endpoint?: { payload?: { supportedTokens?: Array<{ datasyncIdToken?: { datasyncIdToken?: string } }> } } }>;
            };
         } | null
      )?.contents?.contents?.[0]?.endpoint?.payload?.supportedTokens?.[2]?.datasyncIdToken?.datasyncIdToken ??
      (innertube.session.context.client as unknown as { visitorData?: string }).visitorData;

   const minter = await getWebPoMinter(innertube);
   const contentPoToken = await minter.mint(videoId);
   const poToken = await minter.mint(dataSyncId!);

   const watchEndpoint = new YTNodes.NavigationEndpoint({ watchEndpoint: { videoId } });

   if (logEvents) console.log(`[Livestream] Fetching player response for video: ${videoId}`);

   const playerResponse = await watchEndpoint.call(innertube.actions, {
      playbackContext: {
         contentPlaybackContext: {
            vis: 0,
            splay: false,
            lactMilliseconds: '-1',
            signatureTimestamp: player?.signature_timestamp,
         },
      },
      contentCheckOk: true,
      racyCheckOk: true,
      serviceIntegrityDimensions: { poToken },
      parse: true,
   });

   const pr = playerResponse as unknown as { streaming_data?: { hls_manifest_url?: string } };
   const manifestUrl = pr.streaming_data?.hls_manifest_url;

   if (!manifestUrl) throw new Error('No HLS manifest URL found in player response. Video might not be a livestream or may be streaming restricted.');

   if (logEvents) console.log(`[Livestream] Manifest URL extracted: ${manifestUrl.substring(0, 80)}...`);

   if (!player) throw new Error('Player not available for deciphering manifest URL');

   let decipheredManifestUrl: string;
   try {
      decipheredManifestUrl = await decipherManifestUrl(manifestUrl, player, contentPoToken);
      if (logEvents) console.log('[Livestream] Manifest URL deciphered successfully');
   } catch (err) {
      if (logEvents) console.error('[Livestream] Error deciphering manifest URL:', err);
      throw new Error(`Failed to decipher manifest URL: ${(err as Error).message}`);
   }

   const stream = createFFmpegStream(decipheredManifestUrl, { isUrl: true, logEvents });

   let errorCount = 0;
   stream.on('error', (err: Error) => {
      if (logEvents) console.error('[Livestream] Stream error:', err);
      errorCount++;
      if (errorCount > 5) {
         if (logEvents) console.error('[Livestream] Too many errors, closing stream');
         stream.destroy();
      }
   });

   if (logEvents) console.log('[Livestream] Stream created successfully');

   return stream;
}

export async function isLivestream(videoId: string, cookies?: string): Promise<boolean> {
   try {
      const innertube = await getInnertube(cookies);
      const info = await innertube.getBasicInfo(videoId);
      return (info.basic_info?.is_live ?? false) || (info.basic_info?.is_upcoming ?? false);
   } catch {
      return false;
   }
}

export interface LivestreamInfo {
   videoId: string;
   title: string | undefined;
   author: string | undefined;
   duration: number | undefined;
   isLive: boolean;
   isUpcoming: boolean;
   viewCount: number | undefined;
   uploadDate: string | undefined;
}

export async function getLivestreamInfo(videoId: string, cookies?: string): Promise<LivestreamInfo> {
   const innertube = await getInnertube(cookies);
   const info = await innertube.getBasicInfo(videoId);
   const basicInfo = info.basic_info;

   return {
      videoId,
      title: basicInfo?.title,
      author: basicInfo?.author,
      duration: basicInfo?.duration,
      isLive: basicInfo?.is_live ?? false,
      isUpcoming: basicInfo?.is_upcoming ?? false,
      viewCount: basicInfo?.view_count,
      uploadDate: basicInfo?.start_timestamp?.toString(),
   };
}
