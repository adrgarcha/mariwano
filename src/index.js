(async () => {
  require("dotenv").config();

  const { Client, GatewayIntentBits } = require("discord.js");
  const { CommandHandler } = require("djs-commander");
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

      new CommandHandler({
        client,
        commandsPath: path.join(__dirname, "commands"),
        eventsPath: path.join(__dirname, "events"),
        validationsPath: path.join(__dirname, "validations"),
        testServer: process.env.GUILD_ID, // Eliminar esta linea cuando el bot se haga publico.
      });

      client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.log(`Hubo un error al conectar con la base de datos: ${error}`);
    }
  })();
})();
