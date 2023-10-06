require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
function choose(){ // devuelve, de unos argumentos, uno al azar. como el random, pero elige uno de los argumentos
	var index=floor(Math.random()*(arguments.length-1))};
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

    if(message.content === ('!frasejoker')){
        const arr = ['quien madruga se encuentra con todo cerrado😔🤙',
                    'para mi el locomotor es solo motor🥵😫',
                    'el tiempo sin ti es empo🙏🤟'];
        message.reply(arr[choose(0,1,2)]);
    }
});

client.login(process.env.DISCORD_TOKEN);
