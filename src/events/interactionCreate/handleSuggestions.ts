import { EmbedBuilder, Interaction, MessageFlags } from 'discord.js';
import { Suggestion } from '../../models/Suggestion';

export default async function (interaction: Interaction) {
   if (!interaction.isButton() || !interaction.customId) return;

   try {
      const [type, suggestionId, action] = interaction.customId.split('.');

      if (!type || !suggestionId || !action) return;

      if (type !== 'suggestion') return;

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const targetSuggestion = await Suggestion.findOne({ suggestionId });

      if (!targetSuggestion) {
         await interaction.editReply('No se ha encontrado la sugerencia.');
         return;
      }

      const targetMessageId = targetSuggestion.messageId;
      const targetMessage = await interaction.channel?.messages.fetch(targetMessageId);
      const targetMessageEmbed = targetMessage?.embeds[0];

      if (!targetMessageEmbed) {
         await interaction.editReply('Ha ocurrido un error al obtener el mensaje de la sugerencia.');
         return;
      }

      if (action === 'approve') {
         if (!interaction.memberPermissions?.has('Administrator')) {
            await interaction.editReply('No tienes permisos para aprobar sugerencias.');
            return;
         }

         targetMessageEmbed.fields[1].value = '✅ Aprobado';
         const updatedEmbed = EmbedBuilder.from(targetMessageEmbed).setColor(0x84e660);

         await Suggestion.findOneAndUpdate({ suggestionId }, { status: 'approved' });

         interaction.editReply('Sugerencia aprobada.');

         targetMessage?.edit({ embeds: [updatedEmbed], components: [] });
         return;
      }

      if (action === 'reject') {
         if (!interaction.memberPermissions?.has('Administrator')) {
            await interaction.editReply('No tienes permisos para aprobar sugerencias.');
            return;
         }

         targetMessageEmbed.fields[1].value = '❌ Rechazada';
         const updatedEmbed = EmbedBuilder.from(targetMessageEmbed).setColor(0xff6161);

         await Suggestion.findOneAndUpdate({ suggestionId }, { status: 'rejected' });

         interaction.editReply('Sugerencia rechazada.');

         targetMessage?.edit({ embeds: [updatedEmbed], components: [] });
         return;
      }

      if (action === 'upvote') {
         const hasVoted = targetSuggestion.upvotes.includes(interaction.user.id) || targetSuggestion.downvotes.includes(interaction.user.id);

         if (hasVoted) {
            await interaction.editReply('Ya has votado en esta sugerencia.');
            return;
         }

         targetSuggestion.upvotes.push(interaction.user.id);
         await targetSuggestion.save();

         targetMessageEmbed.fields[2].value = `A favor: ${targetSuggestion.upvotes.length} | En contra: ${targetSuggestion.downvotes.length}`;

         interaction.editReply('Sugerencia votada a favor.');

         targetMessage?.edit({ embeds: [targetMessageEmbed] });
         return;
      }

      if (action === 'downvote') {
         const hasVoted = targetSuggestion.upvotes.includes(interaction.user.id) || targetSuggestion.downvotes.includes(interaction.user.id);

         if (hasVoted) {
            await interaction.editReply('Ya has votado en esta sugerencia.');
            return;
         }

         targetSuggestion.downvotes.push(interaction.user.id);
         await targetSuggestion.save();

         targetMessageEmbed.fields[2].value = `A favor: ${targetSuggestion.upvotes.length} | En contra: ${targetSuggestion.downvotes.length}`;

         interaction.editReply('Sugerencia votada en contra.');

         targetMessage.edit({ embeds: [targetMessageEmbed] });
         return;
      }
   } catch (error) {
      console.error(`Hubo un error en el manejador de sugerencias: ${error}`);
   }
}
