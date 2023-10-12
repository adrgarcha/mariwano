require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

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

        eventHandler(client);

        client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.log(`Hubo un error al conectar con la base de datos: ${error}`);
    }
})();

// client.on('interactionCreate', async (interaction) => {
//     // COMANDOS
//     if(interaction.isChatInputCommand()){
    
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