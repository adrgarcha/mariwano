import { Font, RankCardBuilder } from 'canvacord';
import { SlashCommandProps } from 'commandkit';
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { Level } from '../../models/Level';
import { calculateLevelXp } from '../../utils/calculateLevelXp';
Font.loadDefault();

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      if (!interaction.guild) {
         await interaction.reply('Sólo puedes ejecutar este comando en un servidor.');
         return;
      }

      try {
         const mentionedUserId = interaction.options.get('target-user')?.value as string;
         const targetUserId = mentionedUserId || interaction.member!.user.id;
         const targetUserObj = await interaction.guild.members.fetch(targetUserId);

         const fetchedLevel = await Level.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id,
         });

         if (!fetchedLevel) {
            await interaction.reply({
               content: mentionedUserId
                  ? `${targetUserObj.user.tag} no tiene ningún nivel.`
                  : 'No tienes ningún nivel todavía. Intenta hablar un poco más.',
               ephemeral: true,
            });
            return;
         }

         let allLevels = await Level.find({
            guildId: interaction.guild.id,
         }).select('-_id userId level xp');

         allLevels.sort((a, b) => {
            if (a.level === b.level) {
               return b.xp - a.xp;
            } else {
               return b.level - a.level;
            }
         });

         let currentRank = allLevels.findIndex(lvl => lvl.userId === targetUserId) + 1;

         const rank = new RankCardBuilder()
            .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
            .setRank(currentRank)
            .setLevel(fetchedLevel.level)
            .setCurrentXP(fetchedLevel.xp)
            .setRequiredXP(calculateLevelXp(fetchedLevel.level))
            .setStatus(targetUserObj.presence !== null ? targetUserObj.presence.status : 'offline')
            .setUsername(targetUserObj.user.username);

         const data = await rank.build();
         const attachment = new AttachmentBuilder(data);
         await interaction.reply({ files: [attachment] });
      } catch (error) {
         console.error(`Ha ocurrido un error con el comando 'level': ${error}`);
      }
   },
   data: new SlashCommandBuilder()
      .setName('level')
      .setDescription('Muestra tu nivel o el de otra persona.')
      .addUserOption(option => option.setName('target-user').setDescription('El usuario que quieres ver su nivel.')),
};
