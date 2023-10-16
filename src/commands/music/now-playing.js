const { useQueue } = require("discord-player");
const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
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

    if (!queue || !queue.isPlaying()) {
      interaction.reply({
        content: "No hay musica reproduciendose.",
        ephemeral: true,
      });
      return;
    }

    const progress = queue.node.createProgressBar();
    let create = progress.replace(/ 0:00/g, " ◉ EN DIRECTO");

    const npEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(queue.currentTrack.thumbnail)
      .setColor("#FF0000")
      .setTitle("Reproduciendo... 🎵")
      .setDescription(
        `${queue.currentTrack.title} ${
          queue.currentTrack.queryType != "arbitrary"
            ? `([Link](${queue.currentTrack.url}))`
            : ""
        }\n${create}`
      )
      .setTimestamp();

    if (queue.currentTrack.requestedBy != null) {
      npEmbed.setFooter({
        text: `Solicitada por: ${
          interaction.user.discriminator != 0
            ? interaction.user.tag
            : interaction.user.username
        }`,
      });
    }

    // let finalComponents = [
    //   (actionButton = new ActionRowBuilder().addComponents(
    //     new ButtonBuilder()
    //       .setCustomId("np-previous")
    //       .setStyle(1)
    //       .setLabel("⏮ Anterior"),
    //     new ButtonBuilder()
    //       .setCustomId("np-pause")
    //       .setStyle(1)
    //       .setLabel("⏯ Reproducir/Pausar"),
    //     new ButtonBuilder()
    //       .setCustomId("np-skip")
    //       .setStyle(1)
    //       .setLabel("⏭ Saltar"),
    //     new ButtonBuilder()
    //       .setCustomId("np-clear")
    //       .setStyle(1)
    //       .setLabel("🧹 Limpiar cola")
    //   )),
    //   (actionButton2 = new ActionRowBuilder().addComponents(
    //     new ButtonBuilder()
    //       .setCustomId("np-loop")
    //       .setStyle(1)
    //       .setLabel("🔁 Bucle"),
    //     new ButtonBuilder()
    //       .setCustomId("np-shuffle")
    //       .setStyle(1)
    //       .setLabel("🔀 Mezclar"),
    //     new ButtonBuilder()
    //       .setCustomId("np-stop")
    //       .setStyle(1)
    //       .setLabel("🛑 Detener cola")
    //   )),
    // ];

    interaction.reply({ embeds: [npEmbed] /*components: finalComponents*/ });
  },
  data: {
    name: "now-playing",
    description: "Muestra la cancion actual.",
  },
};
