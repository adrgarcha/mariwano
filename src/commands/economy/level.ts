import { AttachmentBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { Font } from 'canvacord';
import { CommandProps } from '../../lib/types';
import { Level } from '../../models/Level';
import { User } from '../../models/User';
import { calculateLevelXp } from '../../utils/calculateLevelXp';
import { ProfileCard } from '../../utils/ProfileCard';

Font.loadDefault();

export const run = async ({ interaction }: CommandProps) => {
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
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      const allLevels = await Level.find({
         guildId: interaction.guild.id,
      }).select('-_id userId level xp');

      allLevels.sort((a, b) => {
         if (a.level === b.level) {
            return b.xp - a.xp;
         } else {
            return b.level - a.level;
         }
      });

      const currentRank = allLevels.findIndex(lvl => lvl.userId === targetUserId) + 1;

      const userData = await User.findOne({
         userId: targetUserId,
         guildId: interaction.guild.id,
      });

      const totalDonated = userData?.totalDonated || 0;
      const totalReceived = userData?.totalReceived || 0;
      const donationCount = userData?.donationCount || 0;

      const presenceStatus = targetUserObj.presence?.status || 'offline';
      const validStatus = presenceStatus === 'invisible' ? 'offline' : presenceStatus;

      const card = new ProfileCard()
         .setUsername(targetUserObj.user.username)
         .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
         .setLevel(fetchedLevel.level)
         .setCurrentXp(fetchedLevel.xp)
         .setRequiredXp(calculateLevelXp(fetchedLevel.level))
         .setRank(currentRank)
         .setStatus(validStatus)
         .setTotalDonated(totalDonated)
         .setTotalReceived(totalReceived)
         .setDonationCount(donationCount);

      const image = await card.build();
      const attachment = new AttachmentBuilder(image, { name: 'profile.png' });

      await interaction.reply({ files: [attachment] });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'level': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('level')
   .setDescription('Muestra tu nivel o el de otra persona.')
   .setContexts([InteractionContextType.Guild])
   .addUserOption(option => option.setName('target-user').setDescription('El usuario que quieres ver su nivel.'));
