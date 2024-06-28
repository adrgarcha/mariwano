import { Client, GuildMember, AttachmentBuilder, TextChannel } from 'discord.js';
import { GuildConfiguration } from '../../models/GuildConfiguration';
import { GreetingsCard } from '../../utils/GreetingsCard';
require('canvacord').Font.loadDefault();

export default async function (member: GuildMember, client: Client) {
   let guild = member.guild;
   if (!guild) return;

   const guildConfiguration = await GuildConfiguration.findOne({
      guildId: guild.id,
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
   guild.channels
      .fetch(guildConfiguration.welcomeChannelIds[0])
      .then(channel => {
         const textChannel = channel as TextChannel;
         return textChannel.send({ files: [attachment] });
      })
      .catch(error => console.log(`Hubo un error al enviar el mensaje de bienvenida: ${error}`));
}
