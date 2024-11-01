import { GuildMember } from 'discord.js';
import { AutoRole } from '../../models/AutoRole';

export default async function (member: GuildMember) {
   try {
      const guild = member.guild;
      if (!guild) return;

      const autoRole = await AutoRole.findOne({ guildId: guild.id });
      if (!autoRole) return;

      await member.roles.add(autoRole.roleId);
   } catch (error) {
      console.error(`Hubo un error al dar el rol automaticamente: ${error}`);
   }
}
