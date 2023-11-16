const { Interaction, EmbedBuilder } = require("discord.js");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {Interaction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      if (!interaction.inGuild()) {
        interaction.reply({
          content: "Solo puedes ejecutar este comando dentro de un servidor.",
          ephemeral: true,
        });
        return;
      }

      const { guild } = interaction;

      const serverInfoEmbed = new EmbedBuilder({
        author: { name: guild.name, iconURL: guild.iconURL({ size: 256 }) },
        fields: [
          {
            name: "Dueño",
            value: (await guild.fetchOwner()).user.username,
            inline: true,
          },
          {
            name: "Canales de texto",
            value: guild.channels.cache.filter((c) => c.type === 0).toJSON()
              .length,
            inline: true,
          },
          {
            name: "Canales de voz",
            value: guild.channels.cache.filter((c) => c.type === 2).toJSON()
              .length,
            inline: true,
          },
          {
            name: "Canales de categoría",
            value: guild.channels.cache.filter((c) => c.type === 4).toJSON()
              .length,
            inline: true,
          },
          {
            name: "Miembros",
            value: guild.memberCount,
            inline: true,
          },
          {
            name: "Roles",
            value: guild.roles.cache.size,
            inline: true,
          },
          {
            name: "Lista de roles",
            value: guild.roles.cache.toJSON().join(", "),
          },
        ],
        footer: {
          text: `ID: ${
            guild.id
          } | Fecha de creación: ${guild.createdAt.toDateString()}`,
        },
      });

      interaction.reply({ embeds: [serverInfoEmbed] });
    } catch (e) {
      console.error(e);
    }
  },
  data: {
    name: "server-info",
    description: "Información sobre el servidor.",
  },
};
