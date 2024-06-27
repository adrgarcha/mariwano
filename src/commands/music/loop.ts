const { QueueRepeatMode, useQueue } = require("discord-player");
const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");

const repeatModes = {
  off: QueueRepeatMode.OFF,
  track: QueueRepeatMode.TRACK,
  queue: QueueRepeatMode.QUEUE,
  autoplay: QueueRepeatMode.AUTOPLAY,
};

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

    const modeName = interaction.options.getString("mode", true);
    const modeValue = repeatModes[modeName.toLowerCase()];

    const mode =
      modeName === "track"
        ? "Bucle en modo 🔂"
        : modeName === "queue"
        ? "Bucle en modo 🔁"
        : modeName === "autoplay"
        ? "Bucle en modo 🤖"
        : "Bucle apagado 🚫";

    const loopEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor("#FF0000")
      .setTitle(mode)
      .setDescription(`El modo del bucle es '${modeName}'`)
      .setTimestamp()
      .setFooter({
        text: `Solicitada por: ${
          interaction.user.discriminator != 0
            ? interaction.user.tag
            : interaction.user.username
        }`,
      });

    try {
      queue.setRepeatMode(modeValue);
      interaction.reply({ embeds: [loopEmbed] });
    } catch (error) {
      console.log(`Hubo un error al hacer un bucle: ${error}`);

      interaction.reply({
        content: `Algo ha ocurrido, hubo un error al hacer el bucle. Intentelo de nuevo.`,
        ephemeral: true,
      });
    }
  },
  data: {
    name: "loop",
    description: "Hace un bucle a la cancion actual o a la cola.",
    options: [
      {
        name: "mode",
        description: "Elige un modo de bucle.",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: Object.keys(repeatModes).map((modeName) => ({
          name: modeName.charAt(0).toUpperCase() + modeName.slice(1),
          value: modeName,
        })),
      },
    ],
  },
};
