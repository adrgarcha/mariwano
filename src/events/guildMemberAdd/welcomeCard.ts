import { Font } from 'canvacord';
import { AttachmentBuilder, GuildMember, TextChannel } from 'discord.js';
import { GuildConfiguration } from '../../models/GuildConfiguration';
import { GreetingsCard } from '../../utils/GreetingsCard';

Font.loadDefault();

export default async function (member: GuildMember) {
   const guild = member.guild;
   if (!guild) return;

   try {
      const guildConfiguration = await GuildConfiguration.findOne({ guildId: guild.id });
      if (!guildConfiguration?.welcomeChannelId) return;

      const welcomeCard = new GreetingsCard()
         .setDisplayName(member.user.username)
         .setAvatar(member.user.displayAvatarURL({ size: 256 }))
         .setMessage(`¡Bienvenido a ${guild.name}!`);

      const data = await welcomeCard.build();
      const attachment = new AttachmentBuilder(data);

      const channel = await guild.channels.fetch(guildConfiguration.welcomeChannelId);
      if (!(channel instanceof TextChannel)) return;

      await channel.send({ files: [attachment] });
   } catch (error) {
      console.error(`Hubo un error al enviar el mensaje de bienvenida: ${error}`);
   }
}
