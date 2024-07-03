import { SlashCommandProps } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';
import { User } from '../../models/User';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      try {
         if (!interaction.guild) {
            await interaction.reply({
               content: 'Sólo puedes ejecutar este comando dentro de un servidor.',
               ephemeral: true,
            });
            return;
         }

         await interaction.deferReply({ ephemeral: true });

         const targetUserId = interaction.options.get('user')?.value || interaction.member?.user.id;

         const user = await User.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id,
         });

         if (!user) {
            interaction.editReply(`<@${targetUserId}> no tiene un perfil todavía. Usa /daily para reclamar la paga diaria.`);
            return;
         }

         interaction.editReply(
            targetUserId === interaction.member?.user.id
               ? `Tienes ${user.balance} gramos de cocaína.`
               : `Los gramos de cocaína de <@${targetUserId}> son ${user.balance}.`
         );
      } catch (error) {
         console.error(`Hubo un error al ejecutar el comando 'balance': ${error}`);
      }
   },
   data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Los gramos de cocaína de tu cuenta o el de otro usuario.')
      .addUserOption(option => option.setName('user').setDescription('El usuario del que quieres saber cuantos gramos tiene.')),
};
