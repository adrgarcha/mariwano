require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log(`🚬 ${c.user.tag} esta fumando.`);
});

client.on('messageCreate', (message) => {
    if(message.author.bot){
        return;
    }

    if(message.content === 'iyow'){
        message.reply('ke paza iyow');
    }

    if(message.content.includes('sale evento')){
        message.reply('el de mis huevos al viento');
    }
});

client.login(process.env.DISCORD_TOKEN);