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

    const shuffleEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor("#FF0000")
      .setTitle("Canciones mezcladas 🔀")
      .setDescription("La musica que hay en la cola se ha mezclado.")
      .setTimestamp()
      .setFooter({
        text: `Solicitada por: ${
          interaction.user.discriminator != 0
            ? interaction.user.tag
            : interaction.user.username
        }`,
      });

    try {
      queue.tracks.shuffle();
      interaction.reply({ embeds: [shuffleEmbed] });
    } catch (error) {
      console.log(`Hubo un error al mezclar la cola: ${error}`);

      interaction.reply({
        content: `Algo ha ocurrido, hubo un error al mezclar las canciones. Intentelo de nuevo.`,
        ephemeral: true,
      });
    }
  },
  data: {
    name: "shuffle",
    description: "Mezcla las canciones de la cola.",
  },
};
