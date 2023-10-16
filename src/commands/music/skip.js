const { useQueue } = require("discord-player");
const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
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

    const skipEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(queue.currentTrack.thumbnail)
      .setColor("#FF0000")
      .setTitle("Cancion saltada ⏭")
      .setDescription(
        `Reproduciendose: ${queuedTracks[0].title} ${
          queuedTracks[0].queryType != "arbitrary"
            ? `([Link](${queuedTracks[0].url}))`
            : ""
        }`
      )
      .setTimestamp()
      .setFooter({
        text: `Solicitada por: ${
          interaction.user.discriminator != 0
            ? interaction.user.tag
            : interaction.user.username
        }`,
      });

    try {
      queue.node.skip();
      interaction.reply({ embeds: [skipEmbed] });
    } catch (error) {
      console.log(`Hubo un error al omitir la cancion: ${error}`);

      interaction.reply({
        content: `Algo ha ocurrido, hubo un error al saltar la cancion. Intentelo de nuevo.`,
        ephemeral: true,
      });
    }
  },
  data: {
    name: "skip",
    description: "Salta la cancion actual.",
  },
};
