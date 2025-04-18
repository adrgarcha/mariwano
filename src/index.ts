import { DefaultExtractors } from '@discord-player/extractor';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
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

   await player.extractors.loadMulti(DefaultExtractors);
   await player.extractors.register(YoutubeiExtractor, {
      generateWithPoToken: true,
      streamOptions: { useClient: 'WEB' },
   });

   player.events
      .on('playerStart', (queue, track) => {
         queue.channel?.send(`▶️ | Reproduciendo **${track.title}**`);
      })
      .on('playerError', (queue, error) => {
         console.error('Error en el reproductor:', error);
         if (queue.metadata && typeof queue.metadata.send === 'function') {
            console.error(`❌ | Ocurrió un error: ${error.message}`);
         }
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
