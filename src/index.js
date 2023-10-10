require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder, ActivityType } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

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

    client.user.setActivity({
        name: 'un buen peta',
        type: ActivityType.Playing,
        // La URL solo funciona con el tipo Streaming y puede ser de YouTube o Twitch.
        //url: 'https://youtu.be/ATsJwGuiL8A?si=isRDznHtgLk-kmFW',
    });
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

        const messages = channel.messages.fetch();
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
    

client.on('interactionCreate', async (interaction) => {
    // COMANDOS
    if(interaction.isChatInputCommand() && !interaction.isButton()){
        if(interaction.commandName === 'sumar'){
            const num1 = interaction.options.get('primer-numero').value;
            const num2 = interaction.options.get('segundo-numero').value;
    
            interaction.reply(`Como no sabes sumar trozo de basura, aqui tienes la suma: ${num1 + num2}`);
        }
    
        // EMBEDS
        if(interaction.commandName === 'embed'){
            const embed = new EmbedBuilder()
            .setTitle('Titulo del embed')
            .setDescription('Descripcion del embed')
            .setColor('Random')
            .addFields({
                name: 'Titulo de campo 1',
                value: 'Valor del campo 1',
                inline: true
            },
            {
                name: 'Titulo de campo 2',
                value: 'Valor del campo 2',
                inline: true
            },
            );
    
            interaction.reply({ embeds: [embed] });
        }
    }

    // BOTONES
    if(interaction.isButton()){
        try {
            await interaction.deferReply({ ephemeral: true });

            const role = interaction.guild.roles.cache.get(interaction.customId);
            if(!role){
                interaction.reply({
                    content: 'No se pudo encontrar este rol.',
                });
                return;
            }

            const hasRole = interaction.member.roles.cache.has(role.id);
            if(hasRole) {
                await interaction.member.roles.remove(role);
                await interaction.editReply(`El rol ${role} ha sido eliminado.`);
                return;
            }
            await interaction.member.roles.add(role);
            await interaction.editReply(`El rol ${role} ha sido agregado.`);
        } catch (error) {
            console.log(`Ha habido un error: ${error}`);
        }
    }

    if(interaction.commandName === 'frasejoker'){
        var str = interaction.options.get('frase').value;
        console.log(str);
        frasesJoker.push(str);
        interaction.reply('Añadida la frase \''+str+'\'');
    }
    
});

client.login(process.env.DISCORD_TOKEN);