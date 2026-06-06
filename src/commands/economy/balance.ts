import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

export const run = async ({ interaction }: CommandProps) => {
   try {
      if (!interaction.guild) {
         await interaction.reply({
            content: 'Sólo puedes ejecutar este comando dentro de un servidor.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const targetUser = interaction.options.getUser('user');
      const targetUserId = targetUser?.id || interaction.member?.user.id;

      if (!targetUserId) {
         await interaction.editReply('No se ha podido obtener el ID del usuario.');
         return;
      }

      const user = await User.findOne({
         userId: targetUserId,
         guildId: interaction.guild.id,
      });

      if (!user) {
         await interaction.editReply(`<@${targetUserId}> no tiene un perfil todavía. Usa /daily para reclamar la paga diaria.`);
         return;
      }

      const currentUserId = interaction.member?.user.id;
      await interaction.editReply(
         targetUserId === currentUserId
            ? `Tienes ${user.balance} gramos de cocaína.`
            : `Los gramos de cocaína de <@${targetUserId}> son ${user.balance}.`
      );
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'balance': ${error}`);
      throw error;
   }
};

export const data = new SlashCommandBuilder()
   .setName('balance')
   .setDescription('Los gramos de cocaína de tu cuenta o el de otro usuario.')
   .addUserOption(option => option.setName('user').setDescription('El usuario del que quieres saber cuantos gramos tiene.'));
