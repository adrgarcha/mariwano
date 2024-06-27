const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
} = require("discord.js");
const User = require("../../models/User");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      const receiveUser = interaction.options.getMentionable("user");
      const donateAmount = interaction.options.getNumber("amount");

      const { balance } = await User.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });

      if (balance < donateAmount) {
        await interaction.reply({
          content: `No tienes ${donateAmount} gramos.`,
          ephemeral: true,
        });
        return;
      }

      if (donateAmount < 1) {
        await interaction.reply({
          content: `Tienes que donar como mínimo 1 gramo de cocaína. No seas rata.`,
          ephemeral: true,
        });
        return;
      }

      const receiveUserData = await User.findOneAndUpdate(
        {
          userId: receiveUser.id,
          guildId: interaction.guild.id,
        },
        {
          $inc: {
            balance: donateAmount,
          },
        }
      );

      if (!receiveUserData) {
        await interaction.reply({
          content: `<@${receiveUser.id}> no está en el sistema monetario.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      await User.findOneAndUpdate(
        {
          userId: interaction.user.id,
          guildId: interaction.guild.id,
        },
        {
          $inc: {
            balance: -donateAmount,
          },
        }
      );

      interaction.editReply(
        `Has donado ${donateAmount} gramos de cocaína al pobre de <@${receiveUser.id}>.`
      );
    } catch (error) {
      console.log(`Ha ocurrido un error con el comando 'donate': ${error}`);
    }
  },

  data: {
    name: "donate",
    description: "Donale a un miembro pobre asqueroso.",
    options: [
      {
        name: "user",
        description: "El pobre asqueroso al que le quieres donar.",
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: "amount",
        description: "La cantidad que le quieres donar al pobre asqueroso.",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
};
