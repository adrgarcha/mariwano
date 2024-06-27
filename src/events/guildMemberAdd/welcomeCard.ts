const { Client, GuildMember, AttachmentBuilder } = require("discord.js");
const GuildConfiguration = require("../../models/GuildConfiguration");
const { GreetingsCard } = require("../../utils/GreetingsCard");
require("canvacord").Font.loadDefault();

/**
 *
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (member, client) => {
  try {
    let guild = member.guild;
    if (!guild) return;

    const guildConfiguration = await GuildConfiguration.findOne({
      guildId: member.guild.id,
    });

    if (!guildConfiguration?.welcomeChannelIds.length) {
      return;
    }

    const welcomeCard = new GreetingsCard()
      .setDisplayName(member.user.username)
      .setAvatar(member.user.displayAvatarURL({ size: 256 }))
      .setMessage(`¡Bienvenido a ${guild.name}!`);

    const data = await welcomeCard.build();
    const attachment = new AttachmentBuilder(data);
    await member.guild.channels.cache.get(guildConfiguration.welcomeChannelIds[0]).send({ files: [attachment] });

  } catch (error) {
    console.log(`Hubo un error en el mensaje de bienvenida: ${error}`);
  }
};
