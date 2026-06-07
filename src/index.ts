import { AttachmentExtractor, SoundCloudExtractor } from '@discord-player/extractor';
import { Player, onBeforeCreateStream } from 'discord-player';
import { SpotifyExtractor } from 'discord-player-spotify';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import 'dotenv/config';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import { commandHandler } from './handlers/commandHandler';
import { eventHandler } from './handlers/eventHandler';
import { deployCommands } from './lib/deployCommands';
import { YoutubeSabrExtractor } from './lib/extractors/YoutubeSabrExtractor';
import { CustomClient } from './lib/types';

let botToken = process.env.DISCORD_TEST_TOKEN!;
let botId = process.env.CLIENT_TEST_ID!;

if (process.env.NODE_ENV === 'production') {
   botToken = process.env.DISCORD_TOKEN!;
   botId = process.env.CLIENT_ID!;
}

(async () => {
   const client = new Client({
      intents: [
         GatewayIntentBits.Guilds,
         GatewayIntentBits.GuildMembers,
         GatewayIntentBits.GuildMessages,
         GatewayIntentBits.GuildPresences,
         GatewayIntentBits.GuildVoiceStates,
         GatewayIntentBits.MessageContent,
         GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
   });
   const player = new Player(client);

   await player.extractors.register(YoutubeSabrExtractor, {
      cookies: process.env.YOUTUBE_COOKIE,
      logSabrEvents: true,
   });
   await player.extractors.register(YoutubeiExtractor, {
      cookie: process.env.YOUTUBE_COOKIE,
      useServerAbrStream: true,
      streamOptions: {
         useClient: 'IOS',
      },
   });
   await player.extractors.register(SoundCloudExtractor, {});
   await player.extractors.register(SpotifyExtractor, {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
   });
   await player.extractors.register(AttachmentExtractor, {});

   onBeforeCreateStream(async track => {
      try {
         if (track.extractor?.identifier === YoutubeSabrExtractor.identifier || track.extractor?.identifier === YoutubeiExtractor.identifier) {
            const result = await track.extractor?.stream(track);
            if (!result || !(result instanceof Readable)) return undefined;
            return result;
         }
         return undefined;
      } catch {
         return undefined;
      }
   });

   player.events
      .on('playerStart', (queue, track) => {
         queue.metadata?.channel?.send(`▶️ | Reproduciendo **${track.title}**`);
      })
      .on('error', (queue, error) => {
         console.error('Error en la cola:', error);
      })
      .on('playerError', (queue, error) => {
         console.error('Error en el reproductor:', error);
         queue.metadata?.channel?.send(`❌ | Ocurrió un error: ${error.message}`);
      });

   await commandHandler(client as CustomClient);
   await deployCommands(botToken, botId);
   await eventHandler(client);

   try {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('Conectado a la base de datos.');
      client.login(botToken);
   } catch (error) {
      console.error(`Hubo un error al conectar con la base de datos: ${error}`);
   }
})();
