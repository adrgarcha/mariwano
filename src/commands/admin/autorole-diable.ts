const { PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const AutoRole = require('../../models/AutoRole');

module.exports = {
    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) =>{
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
    data: {
        name: 'autorole-disable',
        description: 'Deshabilita el auto-rol para este servidor.',
        permissionsRequired: [PermissionFlagsBits.Administrator],
    },
}