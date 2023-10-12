require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const mongoose = require('mongoose');
const path = require('path');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.MessageContent,
    ],
});

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a la base de datos.');

        new CommandHandler({
            client,
            commandsPath: path.join(__dirname, 'commands'),
            eventsPath: path.join(__dirname, 'events'),
            validationsPath: path.join(__dirname, 'validations'),
            testServer: process.env.GUILD_ID,
        });

        client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.log(`Hubo un error al conectar con la base de datos: ${error}`);
    }
})();