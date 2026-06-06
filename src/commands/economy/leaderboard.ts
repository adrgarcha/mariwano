import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

const TOP_USERS_LIMIT = 10;

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      await interaction.deferReply();

      const { username, id } = interaction.user;
      const user = await User.findOne({
         userId: id,
         guildId: interaction.guild.id,
      });
      const balance = user?.balance;

      const leaderboardEmbed = new EmbedBuilder()
         .setTitle(`**Top ${TOP_USERS_LIMIT} usuarios con más gramos de cocaína**`)
         .setColor(0x45d6fd)
         .setFooter({ text: 'No estás en el ranking.' });

      const topUsers = await User.find({ guildId: interaction.guild.id })
         .sort({ balance: -1 })
         .limit(TOP_USERS_LIMIT)
         .catch(err => {
            console.error(`Hubo un error al obtener al usuario del ranking: ${err}`);
            return null;
         });

      if (!topUsers || topUsers.length === 0) {
         await interaction.editReply({
            content: 'No hay usuarios en el ranking.',
         });
         return;
      }

      const userRank = topUsers.findIndex(topUser => topUser.userId === id);

      if (userRank === -1) {
         await interaction.editReply({
            content: 'No estás en el ranking. Prueba a utilizar el comando /daily.',
         });
         return;
      }

      leaderboardEmbed.setFooter({
         text: `${username}, estás clasificado en el número #${userRank + 1} con ${balance}`,
      });

      const memberData = await Promise.all(
         topUsers.map(async topUser => {
            try {
               const member = await interaction.guild!.members.fetch(topUser.userId);
               return { userId: topUser.userId, balance: topUser.balance, member };
            } catch {
               return null;
            }
         })
      );

      const description = memberData
         .filter((data): data is NonNullable<typeof data> => data !== null)
         .map((data, index) => `**${index + 1}) <@${data.userId}>:** ${data.balance} gramos de cocaína`)
         .join('\n');

      if (description) {
         leaderboardEmbed.setDescription(description);
      }

      await interaction.editReply({ embeds: [leaderboardEmbed] });
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'leaderboard': ${error}`);
      await interaction.editReply({
         content: 'Hubo un error al cargar el ranking. Inténtalo de nuevo más tarde.',
      });
   }
};

export const data = new SlashCommandBuilder().setName('leaderboard').setDescription('Muestra el Top 10 de usuarios con más gramos de cocaína.');
