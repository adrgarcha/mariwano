import { Interaction, EmbedBuilder } from 'discord.js';
import { Report } from '../../models/Report';

export const handleReports = async (interaction: Interaction) => {
   if (!interaction.isButton() || !interaction.customId) return;

   try {
      const [type, reportId, action] = interaction.customId.split('.');

      if (!type || !reportId || !action) return;

      if (type !== 'report') return;

      await interaction.deferReply({ ephemeral: true });

      const targetReport = await Report.findOne({ reportId });
      const targetReportId = targetReport?.reportId;

      if (!targetReportId) {
         await interaction.editReply('No se ha encontrado el informe.');
         return;
      }

      const targetMessage = await interaction.channel?.messages.fetch(targetReportId);
      const targetMessageEmbed = targetMessage?.embeds[0];

      if (action === 'solved') {
         if (!interaction.memberPermissions?.has('Administrator')) {
            await interaction.editReply('No tienes permisos para marcar como solucionado un informe.');
            return;
         }

         if (!targetMessageEmbed) {
            await interaction.editReply('Ha ocurrido un error al obtener el mensaje del informe.');
            return;
         }

         targetMessageEmbed.fields[2].value = '✅ Solucionado';
         const updatedEmbed = EmbedBuilder.from(targetMessageEmbed).setColor(0x84e660);

         await Report.findOneAndUpdate({ reportId }, { status: 'solved' });

         interaction.editReply('Error solucionado. Muchas gracias por su informe.');

         targetMessage?.edit({
            embeds: [updatedEmbed],
            components: [],
         });
         return;
      }

      if (action === 'fake') {
         if (!interaction.memberPermissions?.has('Administrator')) {
            await interaction.editReply('No tienes permisos para marcar como falso un informe.');
            return;
         }

         if (!targetMessageEmbed) {
            await interaction.editReply('Ha ocurrido un error al obtener el mensaje del informe.');
            return;
         }

         targetMessageEmbed.fields[2].value = '❕ Falso';
         const updatedEmbed = EmbedBuilder.from(targetMessageEmbed).setColor(0xffffff);

         await Report.findOneAndUpdate({ reportId }, { status: 'fake' });

         interaction.editReply('Informe falso. Se tomaran medidas con el usuario conveniente por divulgar información falsa.');

         targetMessage?.edit({
            embeds: [updatedEmbed],
            components: [],
         });
         return;
      }
   } catch (error) {
      console.log(`Hubo un error en el manejador de informes: ${error}`);
   }
};
