const {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      const targetUserId = interaction.options.get("target-user").value;
      const reason =
        interaction.options.get("reason")?.value ||
        "No se proporcionó una razón";

      await interaction.deferReply();

      const targetUser = await interaction.guild.members.fetch(targetUserId);

      if (!targetUser) {
        await interaction.editReply(
          `El usuario ${targetUser} no existe en este servidor.`
        );
        return;
      }

      if (targetUser.id === interaction.guild.ownerId) {
        await interaction.editReply(
          `No intentes expulsar al dueño del servidor cantamañanas.`
        );
        return;
      }

      const targetUserRolePosition = targetUser.roles.highest.position; // El rol mas alto del usuario objetivo.
      const requestUserRolePosition = interaction.member.roles.highest.position; // El rol mas alto del usuario que ejecuta el comando.
      const botRolePosition =
        interaction.guild.members.me.roles.highest.position; // El rol mas alto del bot.

      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.editReply(
          `No puedes expulsar al usuario ${targetUser} porque tiene el mismo o superior rol al tuyo.`
        );
        return;
      }

      if (targetUserRolePosition >= botRolePosition) {
        await interaction.editReply(
          `No puedo expulsar al usuario ${targetUser} porque tiene el mismo o superior rol que el mio.`
        );
        return;
      }

      try {
        await targetUser.kick(reason);
        await interaction.editReply(
          `El usuario ${targetUser} ha sido expulsado.\nRazon: ${reason}`
        );
      } catch (error) {
        console.log(`Hubo un error al expulsar al usuario: ${error}`);
      }
    } catch (err) {
      console.log(err);
    }
  },
  data: {
    name: "kick",
    description: "Expulsa un miembro.",
    options: [
      {
        name: "target-user",
        description: "El usuario que quieres expulsar.",
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: "reason",
        description: "La razon de la expulsion.",
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
  options: {
    userPermissions: ["KickMembers"],
    botPermissions: ["KickMembers"],
  },
};
