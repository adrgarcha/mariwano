const { Client, GuildMember, AttachmentBuilder } = require("discord.js");
const { Welcomer } = require("canvacord");
const GuildConfiguration = require("../../models/GuildConfiguration");

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

    const welcomeCard = new Welcomer()
      .setUsername(member.user.username)
      .setDiscriminator(member.user.discriminator)
      .setAvatar(member.user.displayAvatarURL({ size: 256 }))
      .setMemberCount(member.guild.memberCount)
      .setBackground("https://cdn.discordapp.com/attachments/1160574192262062112/1177733568219320330/--------_on_Instagram___comenten_algo_asi_no_muere_la_cuenta_jeje_--__CJpSOt3DiR6mb3RMTd2rOfKf7a4raF.jpg?ex=657394db&is=65611fdb&hm=b3dc09ade4095f84895510f234a51dff03dff7bdb2fa7ac86de441d734152066&");

    const data = await welcomeCard.build();
    const attachment = new AttachmentBuilder(data);
    await member.guild.channels.cache.get(guildConfiguration.welcomeChannelIds[0]).send({ files: [attachment] });

  } catch (error) {
    console.log(`Hubo un error en el mensaje de bienvenida: ${error}`);
  }
};
