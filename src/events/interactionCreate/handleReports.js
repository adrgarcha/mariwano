const { Interaction } = require("discord.js");
const Report = require("../../models/Report");

/**
 *
 * @param {Interaction} interaction
 */
module.exports = async (interaction) => {
  if (!interaction.isButton() || !interaction.customId) return;

  try {
    const [type, reportId, action] = interaction.customId.split(".");

    if (!type || !reportId || !action) return;

    if (type !== "report") return;

    await interaction.deferReply();

    const targetReport = await Report.findOne({ reportId });
    const targetMessage = await interaction.channel.messages.fetch(
      targetReport.messageId
    );
    const targetMessageEmbed = targetMessage.embeds[0];

    if (action === "solved") {
      if (!interaction.memberPermissions.has("Administrator")) {
        await interaction.editReply(
          "No tienes permisos para marcar como solucionado un informe."
        );
        return;
      }

      targetReport.status = "solved";

      targetMessageEmbed.data.color = 0x84e660;
      targetMessageEmbed.fields[2].value = "✅ Solucionado";

      await targetReport.save();

      interaction.editReply("Bug solucionado.");

      targetMessage.edit({
        embeds: [targetMessageEmbed],
        components: [],
      });
      return;
    }

    if (action === "fake") {
      if (!interaction.memberPermissions.has("Administrator")) {
        await interaction.editReply(
          "No tienes permisos para marcar como falso un informe."
        );
        return;
      }

      targetReport.status = "fake";

      targetMessageEmbed.data.color = 0xffffff;
      targetMessageEmbed.fields[2].value = "❕ Falso";

      await targetReport.save();

      interaction.editReply(
        "Informe falso. Se tomaran medidas con el usuario conveniente por divulgar información falsa."
      );

      targetMessage.edit({
        embeds: [targetMessageEmbed],
        components: [],
      });
      return;
    }
  } catch (error) {
    console.log(`Hubo un error en el manejador de informes: ${error}`);
  }
};
