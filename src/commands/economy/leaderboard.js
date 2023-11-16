const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      await interaction.deferReply();

      const { username, id } = interaction.user;
      const { balance } = await User.findOne({
        userId: id,
        guildId: interaction.guild.id,
      });

      let leaderboardEmbed = new EmbedBuilder()
        .setTitle("**Top 10 usuarios con más gramos de cocaína**")
        .setColor(0x45d6fd)
        .setFooter({ text: "No estás en el ranking." });

      const members = await User.find({
        guildId: interaction.guild.id,
      })
        .sort({ balance: -1 })
        .catch((err) =>
          console.log(`Hubo un error al obtener al usuario del ranking: ${err}`)
        );

      const memberIndex = members.findIndex((member) => member.userId === id);

      leaderboardEmbed.setFooter({
        text: `${username}, estás clasificado en el número #${
          memberIndex + 1
        } con ${balance}`,
      });

      const topTen = members.slice(0, 10);

      let description = "";
      for (let i = 0; i < topTen.length; i++) {
        let { user } = await interaction.guild.members.fetch(topTen[i].userId);

        if (!user) return;

        let userBalance = topTen[i].balance;
        description += `**${i + 1}) <@${
          user.id
        }>:** ${userBalance} gramos de cocaína\n`;
      }

      if (description !== "") {
        leaderboardEmbed.setDescription(description);
      }

      await interaction.editReply({ embeds: [leaderboardEmbed] });
    } catch (e) {
      console.error(e);
    }
  },
  data: {
    name: "leaderboard",
    description: "Muestra el Top 10 de usuarios con más gramos de cocaína.",
  },
};
