import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
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
         .setTitle('**Top 10 usuarios con más gramos de cocaína**')
         .setColor(0x45d6fd)
         .setFooter({ text: 'No estás en el ranking.' });

      const members = await User.find({
         guildId: interaction.guild.id,
      })
         .sort({ balance: -1 })
         .catch(err => console.error(`Hubo un error al obtener al usuario del ranking: ${err}`));

      const memberIndex = members?.findIndex(member => member.userId === id);

      if (memberIndex === undefined || memberIndex === -1) {
         await interaction.editReply({
            content: 'No estás en el ranking. Prueba a utilizar el comando /daily.',
         });
         return;
      }

      leaderboardEmbed.setFooter({
         text: `${username}, estás clasificado en el número #${memberIndex + 1} con ${balance}`,
      });

      const topTen = members?.slice(0, 10);

      if (!topTen) {
         await interaction.editReply({
            content: 'No hay usuarios en el ranking.',
         });
         return;
      }

      let description = '';
      for (let i = 0; i < topTen.length; i++) {
         const { user } = await interaction.guild.members.fetch(topTen[i].userId);

         if (!user) continue;

         if (description.includes(`<@${user.id}>`)) continue;

         const userBalance = topTen[i].balance;
         description += `**${i + 1}) <@${user.id}>:** ${userBalance} gramos de cocaína\n`;
      }

      if (description !== '') {
         leaderboardEmbed.setDescription(description);
      }

      await interaction.editReply({ embeds: [leaderboardEmbed] });
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'leaderboard': ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('leaderboard').setDescription('Muestra el Top 10 de usuarios con más gramos de cocaína.');
