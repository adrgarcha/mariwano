import { PassThrough, once } from 'stream';
import https from 'https';
import http from 'http';

export function toNodeReadable(stream: ReadableStream<Uint8Array>, minBufferBytes = 128 * 1024): Promise<PassThrough> {
   const nodeStream = new PassThrough({ highWaterMark: 512 * 1024 });
   const reader = stream.getReader();
   let buffered = 0;
   let resolved = false;

   return new Promise(resolve => {
      (async () => {
         try {
            while (true) {
               const { done, value } = await reader.read();
               if (done) break;
               if (value) {
                  if (!nodeStream.write(Buffer.from(value))) await once(nodeStream, 'drain');
                  buffered += value.byteLength;
                  if (!resolved && buffered >= minBufferBytes) {
                     resolved = true;
                     resolve(nodeStream);
                  }
               }
            }
            if (!resolved) resolve(nodeStream);
            nodeStream.end();
         } catch (err) {
            if (!resolved) resolve(nodeStream);
            nodeStream.destroy(err instanceof Error ? err : new Error(String(err)));
         }
      })();
   });
}

export function makeRequest(url: string, options: Record<string, unknown> = {}): Promise<string> {
   return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const requestOptions = {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ...(options.headers as Record<string, string> | undefined),
         },
         ...options,
      };

      const req = protocol.get(url, requestOptions, res => {
         let data = '';
         res.on('data', (chunk: Buffer) => {
            data += chunk;
         });
         res.on('end', () => {
            resolve(data);
         });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
         req.destroy();
         reject(new Error('Request timeout'));
      });
   });
}

interface M3U8Segment {
   url: string;
   duration: number;
}

export function parseM3U8(m3u8Content: string, baseUrl: string): M3U8Segment[] {
   const lines = m3u8Content.split('\n');
   const segments: M3U8Segment[] = [];
   let currentDuration = 0;

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
         const durationMatch = line.match(/#EXTINF:([\d.]+)/);
         if (durationMatch) currentDuration = parseFloat(durationMatch[1]);
      } else if (line && !line.startsWith('#')) {
         const segmentUrl = line.startsWith('http') ? line : new URL(line, baseUrl).href;

         segments.push({ url: segmentUrl, duration: currentDuration });
         currentDuration = 0;
      }
   }

   return segments;
}

interface PlayerResponseStreamingData {
   hls_manifest_url?: string;
   dash_manifest_url?: string;
   formats?: Array<{ url?: string }>;
}

interface PlayerResponseWithStreaming {
   streaming_data?: PlayerResponseStreamingData;
}

export function extractManifestUrl(playerResponse: PlayerResponseWithStreaming): string | null {
   if (playerResponse.streaming_data?.hls_manifest_url) return playerResponse.streaming_data.hls_manifest_url;

   if (playerResponse.streaming_data?.dash_manifest_url) return playerResponse.streaming_data.dash_manifest_url;

   const formats = playerResponse.streaming_data?.formats ?? [];
   for (const format of formats) {
      if (format.url && (format.url.includes('manifest') || format.url.includes('.m3u8'))) return format.url;
   }

   return null;
}
