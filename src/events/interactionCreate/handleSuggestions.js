const { Interaction } = require("discord.js");
const Suggestion = require("../../models/Suggestion");

/**
 *
 * @param {Interaction} interaction
 */
module.exports = async (interaction) => {
  if (!interaction.isButton() || !interaction.customId) return;

  try {
    const [type, suggestionId, action] = interaction.customId.split(".");

    if (!type || !suggestionId || !action) return;

    if (type !== "suggestion") return;

    await interaction.deferReply({ ephemeral: true });

    const targetSuggestion = await Suggestion.findOne({ suggestionId });
    const targetMessage = await interaction.channel.messages.fetch(
      targetSuggestion.messageId
    );
    const targetMessageEmbed = targetMessage.embeds[0];

    if (action === "approve") {
      if (!interaction.memberPermissions.has("Administrator")) {
        await interaction.editReply(
          "No tienes permisos para aprobar sugerencias."
        );
        return;
      }

      targetSuggestion.status = "approved";

      targetMessageEmbed.data.color = 0x84e660;
      targetMessageEmbed.fields[1].value = "✅ Approved";

      await targetSuggestion.save();

      interaction.editReply("Sugerencia aprobada.");

      targetMessage.edit({
        embeds: [targetMessageEmbed],
        components: [],
      });
      return;
    }

    if (action === "reject") {
      if (!interaction.memberPermissions.has("Administrator")) {
        await interaction.editReply(
          "No tienes permisos para rechazar sugerencias."
        );
        return;
      }

      targetSuggestion.status = "rejected";

      targetMessageEmbed.data.color = 0xff6161;
      targetMessageEmbed.fields[1].value = "❌ Rechazado";

      await targetSuggestion.save();

      interaction.editReply("Sugerencia rechazada.");

      targetMessage.edit({
        embeds: [targetMessageEmbed],
        components: [],
      });
      return;
    }

    if (action === "upvote") {
      const hasVoted =
        targetSuggestion.upvotes.includes(interaction.user.id) ||
        targetSuggestion.downvotes.includes(interaction.user.id);

      if (hasVoted) {
        await interaction.editReply("Ya has votado en esta sugerencia.");
        return;
      }

      targetSuggestion.upvotes.push(interaction.user.id);

      await targetSuggestion.save();

      interaction.editReply("Sugerencia votada a favor.");

      targetMessageEmbed.fields[2].value = `A favor: ${targetSuggestion.upvotes.length} | En contra: ${targetSuggestion.downvotes.length}`;

      targetMessage.edit({
        embeds: [targetMessageEmbed],
      });
    }

    if (action === "downvote") {
      const hasVoted =
        targetSuggestion.upvotes.includes(interaction.user.id) ||
        targetSuggestion.downvotes.includes(interaction.user.id);

      if (hasVoted) {
        await interaction.editReply("Ya has votado en esta sugerencia.");
        return;
      }

      targetSuggestion.downvotes.push(interaction.user.id);

      await targetSuggestion.save();

      interaction.editReply("Sugerencia votada en contra.");

      targetMessageEmbed.fields[2].value = `A favor: ${targetSuggestion.upvotes.length} | En contra: ${targetSuggestion.downvotes.length}`;

      targetMessage.edit({
        embeds: [targetMessageEmbed],
      });
    }
  } catch (error) {
    console.log(`Hubo un error en el manejador de sugerencias: ${error}`);
  }
};
