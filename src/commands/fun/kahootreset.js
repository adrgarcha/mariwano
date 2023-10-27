const { ChatInputCommandInteraction } = require("discord.js");
const User = require("../../models/User");
module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    if (!interaction.inGuild) {
      interaction.reply({
        content: "Solo puedes ejecutar este comando en un servidor.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };
      let porrero = {
        userId: "304997583107915778",
        guildId: interaction.guild.id,
      };
      let user = await User.findOne(query);
      let porrazo = await User.findOne(porrero);
      if (user) {
        const userBalance = user.balance;
        const userKahootLimit = user.kahootLimit;
        if (userKahootLimit <= 4) {
          interaction.editReply(
            `No puedes devolver menos de 5 tiradas del kahoot`
          );
          return;
        }
      } else {
        user = new User({
          ...query,
          kahootLimit: 0,
        });
      }
      const cantidadADevolver = (user.kahootLimit / 5) * 475;
      user.balance += cantidadADevolver;
      user.kahootLimit %= 5;

      await user.save();

      porrazo.balance -= cantidadADevolver;
      await porrazo.save();

      interaction.editReply(
        `Has sido devuelto ${cantidadADevolver} gramos. Número de intentos actuales: ${user.kahootLimit}`
      );
    } catch (error) {
      console.log(`Ha ocurrido un error con las diarias: ${error}`);
    }
  },
  data: {
    name: "kahootreset",
    description: "Recarga 5 intentos del kahoot por 475 gramos",
  },
};
