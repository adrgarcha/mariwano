const { Interaction, ApplicationCommandOptionType } = require("discord.js");
const User = require("../../models/User");

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
          content: "Solo puedes ejecutar este comando en un servidor.",
          ephemeral: true,
        });
        return;
      }

      const amount = interaction.options.get("amount").value;

      if (amount < 100) {
        interaction.reply({
          content: "Debes apostar al menos 100 gramos de cocaína.",
          ephemeral: true,
        });
        return;
      }

      let user = await User.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });

      if (!user) {
        user = new User({
          userId: interaction.user.id,
        });
      }

      if (amount > user.balance) {
        interaction.reply({
          content: "No tienes suficientes gramos de cocaína para apostar.",
          ephemeral: true,
        });
        return;
      }

      const hasWin = Math.random() > 0.5; // 50% de ganar

      if (!hasWin) {
        user.balance -= amount;
        await user.save();

        interaction.reply(
          `No has ganado nada, pero recuerda que el 90% de la gente siempre lo deja antes de recuperarlo todo 🤑.\nAhora mismo tienes ${user.balance} gramos.`
        );
        return;
      }

      const amountWon = Number((amount * (Math.random() + 0.55)).toFixed(0));

      user.balance += amountWon;
      await user.save();

      interaction.reply(
        `🎉 Has ganado ${amountWon} 🎊.\nAhora mismo tienes ${user.balance} gramos.`
      );
    } catch (error) {
      console.log(`Ha ocurrido un error con el comando 'gamble': ${error}`);
    }
  },
  data: {
    name: "gamble",
    description: "Conviértete en ludópata.",
    options: [
      {
        name: "amount",
        description: "La cantidad que vas a apostar.",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
};
