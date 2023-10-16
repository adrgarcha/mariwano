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

    const stopEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor("#FF0000")
      .setTitle("Musica detenida 🛑")
      .setDescription("La musica se ha detenido... Saliendo del canal.")
      .setTimestamp()
      .setFooter({
        text: `Solicitada por: ${
          interaction.user.discriminator != 0
            ? interaction.user.tag
            : interaction.user.username
        }`,
      });

    try {
      queue.delete();
      interaction.reply({ embeds: [stopEmbed] });
    } catch (error) {
      console.log(`Hubo un error al detener la musica: ${error}`);

      interaction.reply({
        content: `Algo ha ocurrido, hubo un error al detener la cola. Intentelo de nuevo.`,
        ephemeral: true,
      });
    }
  },
  data: {
    name: "stop",
    description: "Desconecta al bot del canal de voz y borra la cola.",
  },
};
