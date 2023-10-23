const {
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
const Report = require("../../models/Report");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      const guildConfiguration = await GuildConfiguration.findOne({
        guildId: interaction.guildId,
      });
      if (!guildConfiguration?.reportChannelIds.length) {
        await interaction.reply({
          content: `Este servidor todavia no ha sido configurado con un canal de informes.`,
          ephemeral: true,
        });
        return;
      }

      if (
        !guildConfiguration.reportChannelIds.includes(interaction.channelId)
      ) {
        await interaction.reply({
          content: `Este canal no se ha configurado como canal de informes.\nUsa uno de estos canales en su lugar: ${guildConfiguration.reportChannelIds
            .map((id) => `<#${id}>`)
            .join(", ")}`,
          ephemeral: true,
        });
        return;
      }

      const modal = new ModalBuilder()
        .setTitle("Informes de bugs y abusos de comandos")
        .setCustomId(`report-${interaction.user.id}`);

      const commandText = new TextInputBuilder()
        .setCustomId("command-input")
        .setRequired(true)
        .setPlaceholder("Solo introduzca el nombre del comando")
        .setLabel("Cuál comando tiene un bug y/o ha sido abusado")
        .setStyle(TextInputStyle.Short);

      const descriptionText = new TextInputBuilder()
        .setCustomId("description-input")
        .setRequired(true)
        .setPlaceholder(
          "Trate de ser lo más detallado posible de forma que los desarrolladores puedan solucionarlo"
        )
        .setLabel("Describe el bug y/o el abuso de comando")
        .setStyle(TextInputStyle.Paragraph);

      const rowOne = new ActionRowBuilder().addComponents(commandText);
      const rowTwo = new ActionRowBuilder().addComponents(descriptionText);

      modal.addComponents(rowOne, rowTwo);
      await interaction.showModal(modal);

      const filter = (i) => i.customId === `report-${interaction.user.id}`;

      const modalInteraction = await interaction
        .awaitModalSubmit({
          filter,
          time: 1000 * 60 * 3, // 3min
        })
        .catch((error) =>
          console.log(`Hubo un error en los informes: ${error}`)
        );

      await modalInteraction.deferReply({ ephemeral: true });

      let reportMessage;

      try {
        reportMessage = await interaction.channel.send(
          "Creando el informe, por favor espere..."
        );
      } catch (error) {
        modalInteraction.editReply(
          "Fallo al crear el informe en este canal. Puede que no tenga suficientes permisos."
        );
        return;
      }

      const reportCommandText =
        modalInteraction.fields.getTextInputValue("command-input");
      const reportDescriptionText =
        modalInteraction.fields.getTextInputValue("description-input");

      const newReport = new Report({
        authorId: interaction.user.id,
        guildId: interaction.guildId,
        messageId: reportMessage.id,
        command: reportCommandText,
        description: reportDescriptionText,
      });

      await newReport.save();

      modalInteraction.editReply("Informe creado 📝");

      const reportEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ size: 256 }),
        })
        .addFields([
          { name: "Comando", value: reportCommandText },
          { name: "Informe", value: reportDescriptionText },
          { name: "Estado", value: "⚠ No solucionado" },
        ])
        .setColor("Red")
        .setTimestamp();

      const solveButton = new ButtonBuilder()
        .setEmoji("✅")
        .setLabel("Solucinado")
        .setStyle(ButtonStyle.Success)
        .setCustomId(`report.${newReport.reportId}.solved`);

      const fakeButton = new ButtonBuilder()
        .setEmoji("❕")
        .setLabel("Falso")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`report.${newReport.reportId}.fake`);

      const row = new ActionRowBuilder().addComponents(solveButton, fakeButton);

      reportMessage.edit({
        content: `${interaction.user} Informe creado.`,
        embeds: [reportEmbed],
        components: [row],
      });
    } catch (error) {
      console.log(`Hubo un error al crear el informe: ${error}`);
    }
  },
  data: {
    name: "report",
    description: "Crea un informe de un bug.",
    dm_permission: false,
  },
};
