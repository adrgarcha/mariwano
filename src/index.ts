import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { CommandKit } from "commandkit";
import { Player } from "discord-player";
import mongoose from "mongoose";
import path from "path";

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
  });

  const player = new Player(client);
  await player.extractors.loadDefault();

  player.events.on("playerStart", (queue, track) => {
    queue.metadata.channel.send(`Reproduciendo **${track.title}**.`);
  });

  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log("Conectado a la base de datos.");

      new CommandKit({
        client,
        commandsPath: path.join(__dirname, "commands"),
        eventsPath: path.join(__dirname, "events"),
        // bulkRegister: true, // Testing
      });

      // client.login(process.env.DISCORD_TOKEN); // Despliegue
      client.login(process.env.DISCORD_TEST_TOKEN); // Testing
    } catch (error) {
      console.log(`Hubo un error al conectar con la base de datos: ${error}`);
    }
  })();
})();
