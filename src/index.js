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

eventHandler(client);

// client.on('ready', (c) => {
//     console.log(`🚬 ${c.user.tag} esta fumando.`);

//     client.user.setActivity({
//         name: 'un buen peta',
//         type: ActivityType.Playing,
//         // La URL solo funciona con el tipo Streaming y puede ser de YouTube o Twitch.
//         //url: 'https://youtu.be/ATsJwGuiL8A?si=isRDznHtgLk-kmFW',
//     });
// });

// // MENSAJES
// client.on('messageCreate', (message) => {
//     if(message.author.bot){
//         return;
//     }

//     if(message.content === 'iyow'){
//         message.reply('ke paza iyow');
//     }

//     if(message.content.includes('sale evento')){
//         message.reply('el de mis huevos al viento');
//     }
// });

// client.on('interactionCreate', async (interaction) => {
//     // COMANDOS
//     if(interaction.isChatInputCommand()){
//         if(interaction.commandName === 'sumar'){
//             const num1 = interaction.options.get('primer-numero').value;
//             const num2 = interaction.options.get('segundo-numero').value;
    
//             interaction.reply(`Como no sabes sumar trozo de basura, aqui tienes la suma: ${num1 + num2}`);
//         }
    
//         // EMBEDS
//         if(interaction.commandName === 'embed'){
//             const embed = new EmbedBuilder()
//             .setTitle('Titulo del embed')
//             .setDescription('Descripcion del embed')
//             .setColor('Random')
//             .addFields({
//                 name: 'Titulo de campo 1',
//                 value: 'Valor del campo 1',
//                 inline: true
//             },
//             {
//                 name: 'Titulo de campo 2',
//                 value: 'Valor del campo 2',
//                 inline: true
//             },
//             );
    
//             interaction.reply({ embeds: [embed] });
//         }
//     }

//     // BOTONES
//     if(interaction.isButton()){
//         try {
//             await interaction.deferReply({ ephemeral: true });

//             const role = interaction.guild.roles.cache.get(interaction.customId);
//             if(!role){
//                 interaction.reply({
//                     content: 'No se pudo encontrar este rol.',
//                 });
//                 return;
//             }

//             const hasRole = interaction.member.roles.cache.has(role.id);
//             if(hasRole) {
//                 await interaction.member.roles.remove(role);
//                 await interaction.editReply(`El rol ${role} ha sido eliminado.`);
//                 return;
//             }
//             await interaction.member.roles.add(role);
//             await interaction.editReply(`El rol ${role} ha sido agregado.`);
//         } catch (error) {
//             console.log(`Ha habido un error: ${error}`);
//         }
//     }
// });

client.login(process.env.DISCORD_TOKEN);