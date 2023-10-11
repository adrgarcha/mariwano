const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const AutoRole = require('../../models/AutoRole');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if(!interaction.inGuild){
            interaction.reply('Solo puedes ejecutar este comando en un servidor.');
            return;
        }

        const targetRoleId = interaction.options.get('role').value;

        try {
            await interaction.deferReply();

            let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

            if(autoRole){
                if(autoRole.roleId === targetRoleId){
                    interaction.editReply(`Auto-rol ya se ha configurado para este rol. Para deshabilitarlo use '/autorole-disable'`);
                    return;
                }

                autoRole.roleId = targetRoleId;
            } else {
                autoRole = new AutoRole({
                    guildId: interaction.guild.id,
                    roleId: targetRoleId,
                });
            }

            await autoRole.save();
            interaction.editReply(`Auto-rol se ha configurado correctamente. Para deshabilitarlo use '/autorole-disable'`);
        } catch (error) {
            console.log(`Hubo un error al configurar el auto-rol: ${error}`);
        }
    },
    name: 'autorole-configure',
    description: 'Configurar el auto-rol para este servidor.',
    options: [
        {
            name: 'role',
            description: 'El rol que quieres darle a nuevos usuarios.',
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.ManageRoles],
}