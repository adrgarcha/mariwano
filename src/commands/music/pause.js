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

    if (!queue || !queue.isPlaying()) {
      interaction.reply({
        content: "No hay musica reproduciendose.",
        ephemeral: true,
      });
      return;
    }

    let checkPause = queue.node.isPaused();

    const pauseEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(queue.currentTrack.thumbnail)
      .setColor("#FF0000")
      .setTitle(`La cancion ${checkPause ? "continua" : "se ha pausado"} ⏯`)
      .setDescription(
        `La reproduccion ha sido **${checkPause ? "continuada" : "pausada"}**.
            Se esta reproduciendo ${queue.currentTrack.title} ${
          queue.currentTrack.queryType != "arbitrary"
            ? `([Link](${queue.currentTrack.url}))`
            : ""
        }.`
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
      queue.node.setPaused(!queue.node.isPaused());
      interaction.reply({ embeds: [pauseEmbed] });
    } catch (error) {
      console.log(`Hubo un error al pausar la cancion: ${error}`);

      interaction.reply({
        content: `Parece que hubo un error ${
          checkPause ? "al continuar" : "al pausar"
        } la cancion. Intentelo de nuevo.`,
        ephemeral: true,
      });
    }
  },
  data: {
    name: "pause",
    description: "Pausa o continua la cancion actual.",
  },
};
