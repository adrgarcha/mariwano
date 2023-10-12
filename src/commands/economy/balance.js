const { ApplicationCommandOptionType, ChatInputCommandInteraction } = require("discord.js");
const User = require('../../models/User');

module.exports = {
    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        if(!interaction.inGuild){
            await interaction.reply({
                content: 'Solo puedes ejecutar este comando dentro de un servidor.',
                ephemeral: true,
            });
            return;
        }

        const targetUserId = interaction.options.get('user')?.value || interaction.member.id;

        const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

        if(!user){
            await interaction.reply(`<@${targetUserId}> no tiene un perfil todavia.`);
            return;
        }

        await interaction.reply(
            targetUserId === interaction.member.id ? `La plata que tienes es ${user.balance}.` : `La plata de <@${targetUserId}> es ${user.balance}.`
        );
    },
    data: {
        name: 'balance',
        description: 'La plata de tu cuenta o el de otro usuario.',
        options: [
            {
                name: 'user',
                description: 'El usuario del que quieres saber cuanta plata tiene.',
                type: ApplicationCommandOptionType.Mentionable,
            },
        ],
    },
}