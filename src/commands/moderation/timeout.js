const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const ms = require('ms');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const mentionable = interaction.options.get('target-user').value;
        const duration = interaction.options.get('duration').value;
        const reason = interaction.options.get('reason')?.value || 'No se proporcionó ninguna razón.';

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if(!targetUser){
            await interaction.editReply(`El usuario ${targetUser} no existe en este servidor.`);
            return;
        }

        if(targetUser.user.bot){
            await interaction.editReply(`No puedo hacer timeout a un bot.`);
            return;
        }

        const msDuration = ms(duration);
        if(isNaN(msDuration)){
            await interaction.editReply(`Proporciona un valor valido de timeout.`);
            return;
        }

        if(msDuration < 5000 || msDuration > 2.419e9){ // Timeout menor que 5 segundos y mayor que 28 dias.
            await interaction.editReply(`La duracion del timeout no puede ser menor a 5 segundos o mayor a 28 dias.`);
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // El rol mas alto del usuario objetivo.
        const requestUserRolePosition = interaction.member.roles.highest.position; // El rol mas alto del usuario que ejecuta el comando.
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // El rol mas alto del bot.

        if(targetUserRolePosition >= requestUserRolePosition){
            await interaction.editReply(`No puedes hacer timeout al usuario ${targetUser} porque tiene el mismo o superior rol al tuyo.`);
            return;
        }

        if(targetUserRolePosition >= botRolePosition){
            await interaction.editReply(`No puedo hacer timeout al usuario ${targetUser} porque tiene el mismo o superior rol que el mio.`);
            return;
        }

        try {
            const { default: prettysMs } = await import('pretty-ms');

            if(targetUser.isCommunicationDisabled()){
                await targetUser.timeout(msDuration, reason);
                await interaction.editReply(`El timeout del usuario ${targetUser} ha sido aumentado a ${prettysMs(msDuration, { verbose: true })}.\nRazon: ${reason}.\n👏 Enhorabuena!`);
                return;
            }

            await targetUser.timeout(msDuration, reason);
            await interaction.editReply(`El usuario ${targetUser} le han realizado un pedazo de timeout de ${prettysMs(msDuration, { verbose: true })}.\nRazon: ${reason}.`);
        } catch (error) {
            console.log(`Hubo un error al hacer timeout: ${error}`);
        }
    },
    name: 'timeout',
    description: 'Realiza un timeout a un miembro.',
    options: [
        {
            name: 'target-user',
            description: 'El miembro que vayas a hacer timeout.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'duration',
            description: 'La duracion del timeout (30m, 1h, 1 day).',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'La razon del timeout.',
            type: ApplicationCommandOptionType.String,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],
}