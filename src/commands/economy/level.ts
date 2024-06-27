const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/Level");
const { RankCardBuilder } = require("canvacord");
require('canvacord').Font.loadDefault();

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      if (!interaction.inGuild()) {
        await interaction.reply(
          "Sólo puedes ejecutar este comando en un servidor."
        );
        return;
      }

      const mentionedUserId = interaction.options.get("target-user")?.value;
      const targetUserId = mentionedUserId || interaction.member.id;
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);

      const fetchedLevel = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });

      if (!fetchedLevel) {
        await interaction.reply({
          content: mentionedUserId
            ? `${targetUserObj.user.tag} no tiene ningún nivel.`
            : "No tienes ningún nivel todavía. Intenta hablar un poco más.",
          ephemeral: true,
        });
        return;
      }

      let allLevels = await Level.find({
        guildId: interaction.guild.id,
      }).select("-_id userId level xp");

      allLevels.sort((a, b) => {
        if (a.level === b.level) {
          return b.xp - a.xp;
        } else {
          return b.level - a.level;
        }
      });

      let currentRank =
        allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

      const rank = new RankCardBuilder()
        .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
        .setRank(currentRank)
        .setLevel(fetchedLevel.level)
        .setCurrentXP(fetchedLevel.xp)
        .setRequiredXP(calculateLevelXp(fetchedLevel.level))
        .setStatus(
          targetUserObj.presence !== null
            ? targetUserObj.presence.status
            : "offline"
        )
        .setUsername(targetUserObj.user.username);

      const data = await rank.build();
      const attachment = new AttachmentBuilder(data);
      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.log(`Ha ocurrido un error con el comando 'level': ${error}`);
    }
  },
  data: {
    name: "level",
    description: "Muestra tu nivel o el de otra persona.",
    options: [
      {
        name: "target-user",
        description: "El usuario que quieres ver su nivel.",
        type: ApplicationCommandOptionType.Mentionable,
      },
    ],
  },
};
