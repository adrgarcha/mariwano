const { ApplicationCommandOptionType, AttachmentBuilder, ChatInputCommandInteraction } = require("discord.js");
const canvacord = require('canvacord');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');

module.exports = {
    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        if (!interaction.inGuild()){
            await interaction.reply('Solo puedes ejecutar este comando en un servidor.');
            return;
        }

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const fetchedLevel = await Level.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id,
        });

        if(!fetchedLevel){
            await interaction.reply(
                mentionedUserId ? `${targetUserObj.user.tag} no tiene ningun nivel.` : 'No tienes ningun nivel todavia.'
            );
            return;
        }

        let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');

        allLevels.sort((a, b) => {
            if(a.level === b.level){
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

        const rank = new canvacord.Rank()
        .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
        .setRank(currentRank)
        .setLevel(fetchedLevel.level)
        .setCurrentXP(fetchedLevel.xp)
        .setRequiredXP(calculateLevelXp(fetchedLevel.level))
        .setStatus(targetUserObj.presence.status)
        .setProgressBar('#FFC300', 'COLOR')
        .setUsername(targetUserObj.user.username)
        .setDiscriminator(targetUserObj.user.discriminator);

        const data = await rank.build();
        const attachment = new AttachmentBuilder(data);
        await interaction.reply({ files: [attachment] });
    },
    data: {
        name: 'level',
        description: 'Muestra tu nivel o el de otra persona.',
        options: [
            {
                name: 'target-user',
                description: 'El usuario que quieres ver su nivel.',
                type: ApplicationCommandOptionType.Mentionable,
            },
        ],
    },
}