require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder, ActivityType} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

var frasesJoker= ['quien madruga se encuentra con todo cerrado😔🤙',
'para mi el locomotor es solo motor🥵😫',
'el tiempo sin ti es empo🙏🤟',
'a veces las personas más frías solo necesitan un sueter😯🥶',
'la piedad es la edad de los pies😔🤙'];

client.on('ready', (c) => {
    console.log(`🚬 ${c.user.tag} esta fumando.`);
});

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
        
        message.reply(frasesJoker[Math.floor(Math.random()*frasesJoker.length)]);
    }
    if(message.content === "!tfj"){
        message.reply(frasesJoker.join("\n"));
    }
    if(message.content === "!lootbox" || message.content === "!lb"){
        const channel = client.channels.cache.get("1160575692455563365");

        if(!channel){
            console.log("Canal no encontrado, especifica una ID válida");
            return;
        }

        const messages = await channel.messages.fetch();
        const botMessages = messages.filter(
            (message) => message.author.id === client.user.id
        );

        const first = botMessages.first();
        const row = new ActionRowBuilder({
            components:[
                {
                    custom_id: "si",
                    label: "Abrir lootbox",
                    style: TextInputStyle.Short,
                    type: ComponentType.TextInput,
                },
                {
                    custom_id: "no",
                    label: "No abrir",
                    style: TextInputStyle.Short,
                    type: ComponentType.TextInput,
                },

            ],
        });
        

         const messageObject = {
            content: "¿Abrir lootbox ahora mismo?\n\nPROBABILIDADES:\n\t⭐ 50% DROP RATE de BANEO (calidad: **común**)\n\t⭐ 49% DROP RATE de NADA (calidad: **raro**)\n\t⭐ 1% DROP RATE de UN BIZUM DE 100€ QUE TE HARÁ KERNEL (calidad: **legendaria**)",
            components: [row],
        };
        if(first){
            first.edit(messageObject);
        } else{
            channel.send(messageObject);
        }
    }

    if(interaction.commandName === 'frasejoker'){
        var str = interaction.options.get('frase').value;
        console.log(str);
        frasesJoker.push(str);
        interaction.reply('Añadida la frase \''+str+'\'');
    }

    
});

client.on('messageReactionAdd', async (reaction) => {
    if(reaction.partial){
        
        await reaction.fetch();
        
    }
    
});


client.login(process.env.DISCORD_TOKEN);
client.on('interactionCreate', (interaction) => {
    if(!interaction.isChatInputCommand() && !interaction.isButton()){
        return;
    }

    if(interaction.commandName === 'sumar'){
        const num1 = interaction.options.get('primer-numero').value;
        const num2 = interaction.options.get('segundo-numero').value;

        interaction.reply(`Como no sabes sumar trozo de basura, aqui tienes la suma: ${num1 + num2}`);
    }

    if(interaction.commandName === 'frasejoker'){
        var str = interaction.options.get('frase').value;
        console.log(str);
        frasesJoker.push(str);
        interaction.reply('Añadida la frase \''+str+'\'');
    }
    
});

client.login(process.env.DISCORD_TOKEN);