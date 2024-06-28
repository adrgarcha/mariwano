import { Client, GuildMember } from 'discord.js';
import { AutoRole } from '../../models/AutoRole';

export const autoRole = async (member: GuildMember, client: Client) => {
   try {
      let guild = member.guild;
      if (!guild) return;

      const autoRole = await AutoRole.findOne({ guildId: guild.id });
      if (!autoRole) return;

      await member.roles.add(autoRole.roleId);
   } catch (error) {
      console.log(`Hubo un error al dar el rol automaticamente: ${error}`);
   }
};
