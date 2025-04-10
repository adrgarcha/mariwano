import { DefaultExtractors } from '@discord-player/extractor';
import { Player } from 'discord-player';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import 'dotenv/config';
import mongoose from 'mongoose';
import { commandHandler } from './handlers/commandHandler';
import { eventHandler } from './handlers/eventHandler';
import { deployCommands } from './lib/deployCommands';
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
   const oauthTokens = process.env.YOUTUBEI_API_KEY!;
   player.extractors.loadMulti(DefaultExtractors); /*
   player.extractors.register(YoutubeiExtractor, {
      authentication: oauthTokens,
      generateWithPoToken: true,
      streamOptions: {
         useClient: 'ANDROID',
      },
      useServerAbrStream: true,
   });
   player.extractors.register(SpotifyExtractor, {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
   });*/
   player.events
      .on('playerStart', (queue, track) => {})
      .on('playerError', (queue, error) => {
         console.error('Error en el reproductor:', error);
         if (queue.metadata && typeof queue.metadata.send === 'function') {
            console.error(`❌ | Ocurrió un error: ${error.message}`);
         }
      })
      .on('error', error => {
         console.error('Error general del reproductor:', error);
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
