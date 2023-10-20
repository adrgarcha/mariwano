(async () => {
  require("dotenv").config();

  const { Client, GatewayIntentBits } = require("discord.js");
  const { CommandKit } = require("commandkit");
  const { Player } = require("discord-player");
  const mongoose = require("mongoose");
  const path = require("path");

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
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Conectado a la base de datos.");

      new CommandKit({
        client,
        commandsPath: path.join(__dirname, "commands"),
        eventsPath: path.join(__dirname, "events"),
        devGuildIds: [process.env.GUILD_ID], // Testing
        devUserIds: [process.env.DEV_ID_1, process.env.DEV_ID_2], // Testing
      });

      // client.login(process.env.DISCORD_TOKEN); // Desplegar
      client.login(process.env.DISCORD_TEST_TOKEN); // Testing
    } catch (error) {
      console.log(`Hubo un error al conectar con la base de datos: ${error}`);
    }
  })();
})();
