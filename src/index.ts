const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
import { Player } from "discord-player";
import { ChatInputCommandInteraction, Partials } from "discord.js";

import "dotenv/config";
import mongoose from "mongoose";
import { commandHandler } from "./lib/commandhandler";
import { deploycommands } from "./lib/deploycommands";
import { eventHandler } from "./lib/eventhandler";

(async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });
  client.commands = new Collection();
  const player = new Player(client);
  await player.extractors.loadDefault();

  player.events.on("playerStart", (queue, track) => {
    queue.metadata.channel.send(`Reproduciendo **${track.title}**.`);
  });

  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log("Conectado a la base de datos.");
      commandHandler(client);
      deploycommands(client);
      eventHandler(client);
      // client.login(process.env.DISCORD_TOKEN); // Despliegue
      client.login(process.env.DISCORD_TEST_TOKEN); // Testing
    } catch (error) {
      console.error(`Hubo un error al conectar con la base de datos: ${error}`);
    }
  })();
})();
