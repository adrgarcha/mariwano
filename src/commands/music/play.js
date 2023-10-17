const { useMainPlayer, QueryType } = require("discord-player");
const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
} = require("discord.js");

const player = useMainPlayer();

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   * @param {Client} param0.client
   */
  run: async ({ interaction, client }) => {
    await interaction.deferReply();
    const query = interaction.options.getString("query", true);

    try {
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

      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (
        !searchResult ||
        searchResult.tracks.length == 0 ||
        !searchResult.tracks
      ) {
        interaction.followUp({
          content: `Parece que no he podido encontrar la cancion que has pedido.`,
          ephemeral: true,
        });
        return;
      }

      const res = await player.play(
        interaction.member.voice.channel.id,
        searchResult,
        {
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
              client: interaction.guild.members.me,
              requestedBy: interaction.user,
            },
            bufferingTimeout: 15000,
            leaveOnStop: true,
            leaveOnStopCooldown: 5000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 15000,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 300000,
            skipOnNoStream: true,
          },
        }
      );

      const message = res.track.playlist
        ? `Se pusieron en la cola las canciones de: **${res.track.playlist.title}**`
        : `Se puso en cola: **${res.track.author} - ${res.track.title}**`;

      interaction.followUp({
        content: message,
      });
      return;
    } catch (error) {
      console.log(`Hubo un error al reproducir musica: ${error}`);

      interaction.followUp({
        content: "Hubo un error al reproducir la musica.",
        ephemeral: true,
      });
      return;
    }
  },
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  autocomplete: async ({ interaction }) => {
    const query = interaction.options.getString("query");
    let returnData = [];
    if (query) {
      const result = await player.search(query);
      if (result.playlist) {
        const title =
          result.playlist.title.length > 100
            ? result.playlist.title.substring(0, 90) + "..(truncated).."
            : result.playlist.title;
        returnData.push({ name: `${title} | Playlist`, value: query });
      }
      for (const track of result.tracks.slice(0, 6)) {
        returnData.push({ name: track.title, value: track.url });
      }
    }
    await interaction.respond(returnData);
  },
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce una cancion el un canal de voz.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("La cancion que quieres reproducir.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
};
