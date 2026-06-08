import { Constants, YTNodes } from 'youtubei.js';
import type { FormatStream } from 'googlevideo/shared-types';
import { EnabledTrackTypes, buildSabrFormat } from 'googlevideo/utils';
import { SabrStream } from 'googlevideo/sabr-stream';
import type { PassThrough } from 'stream';
import { getWebPoMinter, invalidateWebPoMinter } from './poTokenGenerator';
import { getInnertube } from './getInnertube';
import { toNodeReadable } from './youtubeSharedUtils';

const DEFAULT_OPTIONS = {
   audioQuality: 'AUDIO_QUALITY_MEDIUM',
   enabledTrackTypes: EnabledTrackTypes.AUDIO_ONLY,
};

type AccountInfoRaw = {
   contents?: {
      contents?: Array<{
         endpoint?: {
            payload?: {
               supportedTokens?: Array<{ datasyncIdToken?: { datasyncIdToken?: string } }>;
            };
         };
      }>;
   };
} | null;

type PlayerResponseRaw = {
   streaming_data?: {
      server_abr_streaming_url?: string;
      adaptive_formats?: FormatStream[];
   };
   player_config?: {
      media_common_config?: {
         media_ustreamer_request_config?: {
            video_playback_ustreamer_config?: unknown;
         };
      };
   };
};

export async function createSabrStream(videoId: string, cookies?: string, logSabrEvents = false): Promise<PassThrough> {
   const innertube = await getInnertube(cookies);
   let accountInfo: AccountInfoRaw;

   try {
      accountInfo = (await innertube.account.getInfo()) as unknown as AccountInfoRaw;
   } catch {
      accountInfo = null;
   }

   const dataSyncId =
      accountInfo?.contents?.contents?.[0]?.endpoint?.payload?.supportedTokens?.[2]?.datasyncIdToken?.datasyncIdToken ??
      (innertube.session.context.client as unknown as { visitorData?: string }).visitorData;

   const minter = await getWebPoMinter(innertube);
   const contentPoToken = await minter.mint(videoId);
   const poToken = await minter.mint(dataSyncId!);

   const watchEndpoint = new YTNodes.NavigationEndpoint({ watchEndpoint: { videoId } });
   const playerResponse = (await watchEndpoint.call(innertube.actions, {
      playbackContext: {
         contentPlaybackContext: {
            vis: 0,
            splay: false,
            lactMilliseconds: '-1',
            signatureTimestamp: innertube.session.player?.signature_timestamp,
         },
      },
      contentCheckOk: true,
      racyCheckOk: true,
      serviceIntegrityDimensions: { poToken },
      parse: true,
   })) as unknown as PlayerResponseRaw;

   const serverAbrStreamingUrl = await innertube.session.player?.decipher(playerResponse.streaming_data?.server_abr_streaming_url);
   const videoPlaybackUstreamerConfig =
      playerResponse.player_config?.media_common_config?.media_ustreamer_request_config?.video_playback_ustreamer_config;

   if (!videoPlaybackUstreamerConfig) throw new Error('ustreamerConfig not found');
   if (!serverAbrStreamingUrl) throw new Error('serverAbrStreamingUrl not found');

   const sabrFormats = (playerResponse.streaming_data?.adaptive_formats ?? []).map(buildSabrFormat);

   const serverAbrStream = new SabrStream({
      formats: sabrFormats,
      serverAbrStreamingUrl,
      videoPlaybackUstreamerConfig: videoPlaybackUstreamerConfig as string,
      poToken: contentPoToken,
      clientInfo: {
         clientName: parseInt(
            (Constants.CLIENT_NAME_IDS as Record<string, string>)[
               (innertube.session.context.client as unknown as { clientName: string }).clientName
            ] ?? '0'
         ),
         clientVersion: (innertube.session.context.client as unknown as { clientVersion: string }).clientVersion,
      },
   });

   let protectionFailureCount = 0;
   let lastStatus: number | null | undefined = null;

   (serverAbrStream as unknown as NodeJS.EventEmitter).on('error', (err: unknown) => {
      if (logSabrEvents) console.error('[SABR] Stream error:', err);
   });

   serverAbrStream.on('streamProtectionStatusUpdate', async statusUpdate => {
      if (statusUpdate.status !== lastStatus) {
         if (logSabrEvents) console.log('Stream Protection Status Update:', statusUpdate);
         lastStatus = statusUpdate.status;
      }

      if (statusUpdate.status === 2) {
         protectionFailureCount = Math.min(protectionFailureCount + 1, 10);
         if (protectionFailureCount === 1 || protectionFailureCount % 5 === 0)
            if (logSabrEvents) console.log(`Rotating PO token... (attempt ${protectionFailureCount})`);

         try {
            const rotationMinter = await getWebPoMinter(innertube, { forceRefresh: protectionFailureCount >= 3 });
            const placeholderToken = rotationMinter.generatePlaceholder(videoId);
            serverAbrStream.setPoToken(placeholderToken);
            const mintedPoToken = await rotationMinter.mint(videoId);
            serverAbrStream.setPoToken(mintedPoToken);
         } catch (err) {
            if (protectionFailureCount === 1 || protectionFailureCount % 5 === 0) if (logSabrEvents) console.error('Failed to rotate PO token:', err);
         }
      } else if (statusUpdate.status === 3) {
         if (logSabrEvents) console.error('Stream protection rejected token (SPS 3). Resetting Botguard.');
         invalidateWebPoMinter();
      } else {
         protectionFailureCount = 0;
      }
   });

   const { audioStream } = await serverAbrStream.start(DEFAULT_OPTIONS);
   return await toNodeReadable(audioStream);
}
