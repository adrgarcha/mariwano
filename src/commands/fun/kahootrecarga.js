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

        if (userBalance < 475) {
          interaction.editReply(`No tienes suficientes gramos.`);
          return;
        }
        if(user.userId == "526530738586255360"){
            interaction.editReply("No hay tiradas para ti, primero devuelve los gramos, ladrón");
        }
      } else {
        user = new User({
          ...query,
          kahootLimit: 0,
        });
      }

      user.kahootLimit += 5;
      user.balance -= 475;
      await user.save();

      interaction.editReply(
        `Has comprado a Porrero exitosamente 5 intentos del kahoot. Número de intentos actuales: ${user.kahootLimit}`
      );
    } catch (error) {
      console.log(`Ha ocurrido un error con las diarias: ${error}`);
    }
  },
  data: {
    name: "kahootrecarga",
    description: "Recarga 5 intentos del kahoot por 475 gramos",
   
  },
};
