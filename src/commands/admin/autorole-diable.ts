import { SlashCommandProps } from 'commandkit';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { AutoRole } from '../../models/AutoRole';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      if (!interaction.guild) {
         interaction.reply('Solo puedes ejecutar este comando en un servidor.');
         return;
      }

      if (!interaction.memberPermissions?.has('Administrator')) {
         await interaction.reply('Solo los administradores pueden ejecutar este comando.');
         return;
      }

      try {
         await interaction.deferReply();

         if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
            await interaction.followUp(`Auto-rol no se ha configurado en el servidor. Usa el comando '/autorole-configure'.`);
            return;
         }

         await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
         await interaction.followUp(`Auto-rol se ha deshabilitado para este servidor. Para habilitarlo usa '/autorole-configure'.`);
      } catch (error) {
         console.error(`Hubo un error al deshabilitar el auto-rol: ${error}`);
      }
   },
   data: new SlashCommandBuilder()
      .setName('autorole-disable')
      .setDescription('Deshabilita el auto-rol para este servidor.')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
};
