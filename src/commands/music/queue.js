const { useQueue } = require("discord-player");
const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   * @param {Client} param0.client
   */
  run: async ({ interaction, client }) => {
    const queue = useQueue(interaction.guildId);

    if (!interaction.member.voice.channelId) {
      await interaction.followUp({
        content: "No estas en un canal de voz.",
        ephemeral: true,
      });
      return;
    }

    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me.voice.channelId
    ) {
      await interaction.followUp({
        content: "No te encuentras en el mismo canal de voz que yo.",
        ephemeral: true,
      });
      return;
    }

    const queuedTracks = queue.tracks.toArray();
    if (!queuedTracks[0]) {
      interaction.reply({
        content: "No hay musica en la cola.",
        ephemeral: true,
      });
      return;
    }

    const tracks = queuedTracks.map(
      (track, index) => `**${index + 1})** [${track.title}](${track.url})`
    );

    const chunkSize = 10;
    const pages = Math.ceil(tracks.length / chunkSize);

    let currentPage = 0;

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Cola de canciones")
      .setDescription(
        tracks
          .slice(currentPage * chunkSize, (currentPage + 1) * chunkSize)
          .join("\n") || "**No hay canciones en espera.**"
      )
      .setFooter({
        text: `Pagina ${currentPage + 1} | ${
          queue.tracks.size
        } canciones en total.`,
      });

    if (pages == 1) {
      interaction.reply({
        embeds: [embed],
      });
      return;
    }

    const prevButton = new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Anterior")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⬅");

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Siguiente")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("➡");

    const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      idle: 60000,
    });

    collector.on("collect", (i) => {
      i.deferUpdate();

      switch (i.customId) {
        case "prev":
          currentPage = currentPage === 0 ? pages - 1 : currentPage - 1;
          break;
        case "next":
          currentPage = currentPage === pages - 1 ? 0 : currentPage + 1;
          break;
        default:
          break;
      }

      embed
        .setDescription(
          tracks
            .slice(currentPage * chunkSize, (currentPage + 1) * chunkSize)
            .join("\n") || "**No hay canciones en espera.**"
        )
        .setFooter({
          text: `Pagina ${currentPage + 1} | ${
            queue.tracks.size
          } canciones en total.`,
        });

      message.edit({
        embeds: [embed],
        components: [row],
      });
    });

    collector.on("end", () => {
      message.edit({
        components: [],
      });
    });
  },
  data: {
    name: "queue",
    description: "Muestra las 10 primeras canciones de la cola con paginacion.",
  },
};
