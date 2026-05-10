import { BG } from 'bgutils-js';
import type { WebPoSignalOutput } from 'bgutils-js';
import { GOOG_API_KEY, USER_AGENT, buildURL } from 'bgutils-js';
import { JSDOM } from 'jsdom';
import { createCanvas, ImageData as CanvasImageData, Canvas } from '@napi-rs/canvas';
import type { Innertube } from 'youtubei.js';

const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';

interface CanvasState {
   canvas: Canvas;
   context: unknown;
}

type DomWindow = ReturnType<JSDOM['window']['constructor']['prototype']['constructor']>;

let domWindow: DomWindow | null = null;
let initializationPromise: Promise<InstanceType<typeof BG.WebPoMinter>> | null = null;
let botguardClient: InstanceType<typeof BG.BotGuardClient> | undefined;
let webPoMinter: InstanceType<typeof BG.WebPoMinter> | undefined;
let activeScriptId: string | null = null;
let canvasPatched = false;

function patchCanvasSupport(window: Record<string, unknown>): void {
   if (canvasPatched) return;

   const HTMLCanvasElement = window['HTMLCanvasElement'] as typeof globalThis.HTMLCanvasElement | undefined;
   if (!HTMLCanvasElement) return;

   Object.defineProperty(HTMLCanvasElement.prototype, '_napiCanvasState', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: null,
   });

   const proto = HTMLCanvasElement.prototype as unknown as {
      getContext: (type: string, options?: unknown) => unknown;
      toDataURL: (...args: unknown[]) => string;
      _napiCanvasState: CanvasState | null;
      width: number;
      height: number;
   };

   proto.getContext = function (this: typeof proto, type: string, options?: unknown) {
      if (type !== '2d') return null;

      const width = Number.isFinite(this.width) && this.width > 0 ? this.width : 300;
      const height = Number.isFinite(this.height) && this.height > 0 ? this.height : 150;
      const state: CanvasState = this._napiCanvasState ?? { canvas: createCanvas(width, height), context: null };

      if (!this._napiCanvasState) {
         state.canvas = createCanvas(width, height);
      } else if (state.canvas.width !== width || state.canvas.height !== height) {
         state.canvas.width = width;
         state.canvas.height = height;
      }

      state.context = state.canvas.getContext('2d', options as Parameters<Canvas['getContext']>[1]);
      this._napiCanvasState = state;
      return state.context;
   };

   proto.toDataURL = function (this: typeof proto, ...args: unknown[]) {
      if (!this._napiCanvasState) {
         const width = Number.isFinite(this.width) && this.width > 0 ? this.width : 300;
         const height = Number.isFinite(this.height) && this.height > 0 ? this.height : 150;
         this._napiCanvasState = { canvas: createCanvas(width, height), context: null };
      }
      return (this._napiCanvasState.canvas as unknown as { toDataURL: (...a: unknown[]) => string }).toDataURL(...args);
   };

   if (!window['ImageData']) window['ImageData'] = CanvasImageData;

   if (!Reflect.has(globalThis, 'ImageData')) {
      Object.defineProperty(globalThis, 'ImageData', {
         configurable: true,
         enumerable: false,
         writable: true,
         value: CanvasImageData,
      });
   }

   canvasPatched = true;
}

function ensureDomEnvironment(userAgent: string): Record<string, unknown> {
   if (domWindow) return domWindow as unknown as Record<string, unknown>;

   const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'https://www.youtube.com/',
      referrer: 'https://www.youtube.com/',
      resources: { userAgent },
   });

   domWindow = dom.window as unknown as DomWindow;
   const win = dom.window as unknown as Record<string, unknown>;

   const globalAssignments: Record<string, unknown> = {
      window: win,
      document: win['document'],
      location: win['location'],
      origin: win['origin'],
      navigator: win['navigator'],
      HTMLElement: win['HTMLElement'],
      atob: win['atob'],
      btoa: win['btoa'],
      crypto: win['crypto'],
      performance: win['performance'],
   };

   for (const [key, value] of Object.entries(globalAssignments)) {
      if (!Reflect.has(globalThis, key)) {
         Object.defineProperty(globalThis, key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value,
         });
      }
   }

   if (!Reflect.has(globalThis, 'self')) {
      Object.defineProperty(globalThis, 'self', {
         configurable: true,
         enumerable: false,
         writable: true,
         value: globalThis,
      });
   }

   patchCanvasSupport(win);

   return win;
}

function resetBotguardState(): void {
   if (botguardClient) {
      try {
         botguardClient.shutdown();
      } catch {
         /* no-op */
      }
   }

   if (activeScriptId && domWindow) {
      const doc = (domWindow as unknown as { document: Document }).document;
      doc.getElementById(activeScriptId)?.remove();
   }

   botguardClient = undefined;
   webPoMinter = undefined;
   activeScriptId = null;
   initializationPromise = null;
}

async function initializeBotguard(innertube: Innertube, { forceRefresh = false } = {}): Promise<InstanceType<typeof BG.WebPoMinter>> {
   if (forceRefresh) resetBotguardState();
   if (webPoMinter) return webPoMinter;
   if (initializationPromise) return await initializationPromise;

   const userAgent = (innertube.session.context.client as unknown as { userAgent?: string }).userAgent ?? USER_AGENT;
   ensureDomEnvironment(userAgent);

   initializationPromise = (async () => {
      const challengeResponse = await innertube.getAttestationChallenge('ENGAGEMENT_TYPE_UNBOUND');
      const challenge = (
         challengeResponse as unknown as {
            bg_challenge?: {
               interpreter_url?: { private_do_not_access_or_else_trusted_resource_url_wrapped_value?: string };
               program?: string;
               global_name?: string;
            };
         }
      )?.bg_challenge;

      if (!challenge) throw new Error('Failed to retrieve Botguard challenge.');

      const interpreterUrl = challenge.interpreter_url?.private_do_not_access_or_else_trusted_resource_url_wrapped_value;
      if (!interpreterUrl) throw new Error('Botguard challenge did not provide an interpreter URL.');

      const win = domWindow as unknown as Record<string, unknown>;
      const doc = win['document'] as Document;

      if (!doc.getElementById(interpreterUrl)) {
         const interpreterResponse = await fetch(`https:${interpreterUrl}`, {
            headers: { 'user-agent': userAgent },
         });

         const interpreterJavascript = await interpreterResponse.text();
         if (!interpreterJavascript) throw new Error('Failed to download Botguard interpreter script.');

         const script = doc.createElement('script');
         script.type = 'text/javascript';
         script.id = interpreterUrl;
         script.textContent = interpreterJavascript;
         doc.head.appendChild(script);
         activeScriptId = script.id;

         const WinFunction = win['Function'] as FunctionConstructor;
         const executeInterpreter = new WinFunction(interpreterJavascript);
         executeInterpreter.call(win);
      }

      botguardClient = await BG.BotGuardClient.create({
         program: challenge.program ?? '',
         globalName: challenge.global_name ?? '',
         globalObj: globalThis as unknown as Record<string, unknown>,
      });

      const webPoSignalOutput: WebPoSignalOutput = [];
      const botguardSnapshot = await botguardClient.snapshot({ webPoSignalOutput });

      const integrityResponse = await fetch(buildURL('GenerateIT', true), {
         method: 'POST',
         headers: {
            'content-type': 'application/json+protobuf',
            'x-goog-api-key': GOOG_API_KEY,
            'x-user-agent': 'grpc-web-javascript/0.1',
            'user-agent': userAgent,
         },
         body: JSON.stringify([REQUEST_KEY, botguardSnapshot]),
      });

      const integrityPayload = (await integrityResponse.json()) as unknown[];
      const integrityToken = integrityPayload?.[0];

      if (typeof integrityToken !== 'string') throw new Error('Botguard integrity token generation failed.');

      webPoMinter = await BG.WebPoMinter.create({ integrityToken }, webPoSignalOutput);
      return webPoMinter;
   })()
      .catch((error: unknown) => {
         resetBotguardState();
         throw error;
      })
      .finally(() => {
         initializationPromise = null;
      });

   return await initializationPromise;
}

function requireBinding(binding: string | undefined): string {
   if (!binding) throw new Error('Content binding is required to mint a WebPO token.');
   return binding;
}

export interface WebPoMinterHandle {
   generatePlaceholder(binding: string): string;
   mint(binding: string): Promise<string>;
}

export async function getWebPoMinter(innertube: Innertube, options: { forceRefresh?: boolean } = {}): Promise<WebPoMinterHandle> {
   const minter = await initializeBotguard(innertube, options);

   return {
      generatePlaceholder(binding: string): string {
         return BG.PoToken.generateColdStartToken(requireBinding(binding));
      },
      async mint(binding: string): Promise<string> {
         return await minter.mintAsWebsafeString(requireBinding(binding));
      },
   };
}

export function invalidateWebPoMinter(): void {
   resetBotguardState();
}

export async function generateDataSyncTokens(innertube: Innertube): Promise<{ dataSyncId: string; fullToken: string }> {
   const accountInfo = await innertube.account.getInfo();
   const raw = accountInfo as unknown as {
      contents: { contents: Array<{ endpoint: { payload: { supportedTokens: Array<{ datasyncIdToken: { datasyncIdToken: string } }> } } }> };
   };
   const dataSyncId = raw.contents.contents[0].endpoint.payload.supportedTokens[2].datasyncIdToken.datasyncIdToken;

   if (!dataSyncId) throw new Error('Data Sync ID not found in account info');

   const minter = await getWebPoMinter(innertube);
   const fullToken = await minter.mint(dataSyncId);

   return { dataSyncId, fullToken };
}
