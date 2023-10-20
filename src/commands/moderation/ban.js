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
    const targetUserId = interaction.options.get("target-user").value;
    const reason =
      interaction.options.get("reason")?.value || "No se proporcionó una razón";

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
        `No intentes banear al dueño del servidor espabilao`
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // El rol mas alto del usuario objetivo.
    const requestUserRolePosition = interaction.member.roles.highest.position; // El rol mas alto del usuario que ejecuta el comando.
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // El rol mas alto del bot.

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        `No puedes banear al usuario ${targetUser} porque tiene el mismo o superior rol al tuyo.`
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        `No puedo banear al usuario ${targetUser} porque tiene el mismo o superior rol que el mio.`
      );
      return;
    }

    try {
      await targetUser.ban({ reason });
      await interaction.editReply(
        `El usuario ${targetUser} ha sido baneado.\nRazon: ${reason}`
      );
    } catch (error) {
      console.log(`Hubo un error al banear al usuario: ${error}`);
    }
  },
  data: {
    name: "ban",
    description: "Banea un miembro.",
    options: [
      {
        name: "target-user",
        description: "El usuario que quieres banear.",
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: "reason",
        description: "La razon del baneo.",
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
  options: {
    userPermissions: ["BanMembers"],
    botPermissions: ["BanMembers"],
  },
};
