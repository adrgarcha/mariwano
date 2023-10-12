const { client, Interaction, ApplicationCommandOptionType } = require("discord.js");
const User = require('../../models/User');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if(!interaction.inGuild){
            interaction.reply({
                content: 'Solo puedes ejecutar este comando dentro de un servidor.',
                ephemeral: true,
            });
            return;
        }

        const targetUserId = interaction.options.get('user')?.value || interaction.member.id;

        await interaction.deferReply();

        const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

        if(!user){
            interaction.editReply(`<@${targetUserId}> no tiene un perfil todavia.`);
            return;
        }

        interaction.editReply(
            targetUserId === interaction.member.id ? `La plata que tienes es ${user.balance}.` : `La plata de <@${targetUserId}> es ${user.balance}.`
        );
    },
    name: 'balance',
    description: 'La plata de tu cuenta o el de otro usuario.',
    options: [
        {
            name: 'user',
            description: 'El usuario del que quieres saber cuanta plata tiene.',
            type: ApplicationCommandOptionType.Mentionable,
        },
    ],
}