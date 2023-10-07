require('dotenv').config();

const { Client, IntentsBitField, Partials } = require('discord.js');
function choose(){ // devuelve, de unos argumentos, uno al azar. como el random, pero elige uno de los argumentos
	var index=floor(Math.random()*(arguments.length-1))};
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Reaction
    ],
});

client.on('ready', (c) => {
    console.log(`🚬 ${c.user.tag} esta fumando.`);
});
var arr;
client.on('messageCreate', async (message) => {
    if(message.author.bot){
        return;
    }

    if(message.content === 'iyow'){
        message.reply('ke paza iyow');
    }

    if(message.content.includes('sale evento')){
        message.reply('el de mis huevos al viento');
    }

    if(message.content === ('!frasejoker') || message.content === ('!fj')){
        arr = ['quien madruga se encuentra con todo cerrado😔🤙',
                    'para mi el locomotor es solo motor🥵😫',
                    'el tiempo sin ti es empo🙏🤟',
                    'a veces las personas más frías solo necesitan un sueter😯🥶',
                    'la piedad es la edad de los pies😔🤙'];
        message.reply(arr[Math.floor(Math.random()*arr.length)]);
    }

    if(message.content.includes('!frasejoker add') || message.content.includes('!fj add')){
        var arr2 = message.content.split(' ').shift().shift();
        var str = arr2.join(' ');
        arr.push(str);
        message.reply("añadidisimo \'" +str+"\' a frases del joker");
    }

    if(message.content === "!lootbox" || message.content === "!lb"){
        const reply = await message.reply(
"¿Abrir lootbox ahora mismo?\n\nPROBABILIDADES:\n\t⭐ 50% DROP RATE de un BAN (calidad: **común**)\n\t⭐ 49% DROP RATE de NADA (calidad: **raro**)\n\t⭐ 1% DROP RATE de UN BIZUM DE 100€ QUE TE HARÁ KERNEL (calidad: **legendaria**)");
        reply.react("✅"); reply.react("❌");
    }
});

client.on('messageReactionAdd', async (reaction) => {
    if(reaction.partial){
        await reaction.fetch();
    }
});


client.login(process.env.DISCORD_TOKEN);
