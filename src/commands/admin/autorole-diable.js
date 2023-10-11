const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const AutoRole = require('../../models/AutoRole');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) =>{
        try {
            await interaction.deferReply();

            if(!await AutoRole.exists({ guildId: interaction.guild.id })){
                interaction.editReply(`Auto-rol no se ha configurado en el servidor. Usa el comando '/autorole-configure'.`);
                return;
            }

            await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
            interaction.editReply(`Auto-rol se ha deshabilitado para este servidor. Para habilitarlo usa '/autorole-configure'.`);
        } catch (error) {
            console.log(`Hubo un error al deshabilitar el auto-rol: ${error}`);
        }
    },
    name: 'autorole-disable',
    description: 'Deshabilita el auto-rol para este servidor.',
    permissionsRequired: [PermissionFlagsBits.Administrator],
}