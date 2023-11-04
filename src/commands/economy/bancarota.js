const { ChatInputCommandInteraction } = require("discord.js");
const User = require("../../models/User");

const dailyAmount = 1000;

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

      let user = await User.findOne(query);

      if (!user) {
        user = new User({
          ...query,
          
        });
        
    }

      user.balance = 0;
      user.investFactor = 0;
      user.kahootLimit = 5;
      await user.save();
      
      interaction.editReply(
        `Tus gramos han sido restablecidos a 0.`
      );
    } catch (error) {
      console.log(`Ha ocurrido un error: ${error}`);
    }
  },
  data: {
    name: "bancarota",
    description: "Restablece tus gramos a 0 (solo para admins)",
  },
};
