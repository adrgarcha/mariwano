import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { Donation } from '../../models/Donation';
import { User } from '../../models/User';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   try {
      await interaction.deferReply();

      const period = interaction.options.getString('period') || 'total';
      const guildId = interaction.guild.id;

      let topDonors: { oderId: string; total: number }[] = [];
      let periodText = '';

      if (period === 'total') {
         periodText = 'histórico';
         const users = await User.find({ guildId }).sort({ totalDonated: -1 }).limit(10);
         topDonors = users.map(user => ({ oderId: user.userId, total: user.totalDonated || 0 }));
      } else {
         const now = new Date();
         let startDate: Date;

         if (period === 'weekly') {
            periodText = 'semanal';
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
         } else {
            periodText = 'mensual';
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
         }

         const aggregation = await Donation.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$fromUserId', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
         ]);

         topDonors = aggregation.map(doc => ({ oderId: doc._id, total: doc.total }));
      }

      const leaderboardEmbed = new EmbedBuilder().setTitle(`🏆 Top 10 Donantes (${periodText})`).setColor(0xf1c40f).setTimestamp();

      if (topDonors.length === 0) {
         leaderboardEmbed.setDescription('No hay donaciones registradas en este periodo.');
         await interaction.editReply({ embeds: [leaderboardEmbed] });
         return;
      }

      let description = '';
      const medals = ['🥇', '🥈', '🥉'];

      for (let i = 0; i < topDonors.length; i++) {
         const donor = topDonors[i];
         if (donor.total <= 0) continue;

         const position = i < 3 ? medals[i] : `**${i + 1}.**`;
         description += `${position} <@${donor.oderId}>: **${donor.total}** gramos donados\n`;
      }

      if (description === '') {
         leaderboardEmbed.setDescription('No hay donaciones registradas en este periodo.');
      } else {
         leaderboardEmbed.setDescription(description);
      }

      const userRank = topDonors.findIndex(d => d.oderId === interaction.user.id);
      if (userRank !== -1) {
         leaderboardEmbed.setFooter({
            text: `${interaction.user.username}, estás en el puesto #${userRank + 1} con ${topDonors[userRank].total} gramos donados`,
            iconURL: interaction.user.displayAvatarURL(),
         });
      } else {
         const userData = await User.findOne({ userId: interaction.user.id, guildId });
         const userDonated = userData?.totalDonated || 0;
         leaderboardEmbed.setFooter({
            text: `${interaction.user.username}, has donado ${userDonated} gramos en total`,
            iconURL: interaction.user.displayAvatarURL(),
         });
      }

      await interaction.editReply({ embeds: [leaderboardEmbed] });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'top-donantes': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('top-donors')
   .setDescription('Muestra el ranking de usuarios que más han donado.')
   .addStringOption(option =>
      option
         .setName('period')
         .setDescription('Periodo de tiempo para el ranking.')
         .addChoices(
            { name: 'Total histórico', value: 'total' },
            { name: 'Última semana', value: 'weekly' },
            { name: 'Último mes', value: 'monthly' }
         )
   );
