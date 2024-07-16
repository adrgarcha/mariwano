import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply('Sólo puedes ejecutar este comando en un servidor.');
      return;
   }

   try {
      const targetUserId = interaction.options.get('target-user')?.value as string;
      const reason = (interaction.options.get('reason')?.value || 'No se proporcionó ninguna razón.') as string | undefined;

      await interaction.deferReply();

      const targetUser = await interaction.guild.members.fetch(targetUserId);

      if (!targetUser) {
         await interaction.editReply(`El usuario ${targetUser} no existe en este servidor.`);
         return;
      }

      if (targetUser.id === interaction.guild.ownerId) {
         await interaction.editReply(`No intentes expulsar al dueño del servidor cantamañanas.`);
         return;
      }

      const targetUserRolePosition = targetUser.roles.highest.position;
      const requestUser = interaction.member as GuildMember;
      const requestUserRolePosition = requestUser.roles.highest.position;
      const botRolePosition = interaction.guild.members.me!.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition) {
         await interaction.editReply(`No puedes expulsar al usuario ${targetUser} porque tiene el mismo o superior rol al tuyo.`);
         return;
      }

      if (targetUserRolePosition >= botRolePosition) {
         await interaction.editReply(`No puedo expulsar al usuario ${targetUser} porque tiene el mismo o superior rol que el mio.`);
         return;
      }

      await targetUser.kick(reason);

      await interaction.editReply(`El usuario ${targetUser} ha sido expulsado.\nRazon: ${reason}`);
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'kick': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('kick')
   .setDescription('Expulsa a un miembro del servidor.')
   .addMentionableOption(option => option.setName('target-user').setDescription('El usuario que deseas expulsar.').setRequired(true))
   .addStringOption(option => option.setName('reason').setDescription('La razon de la expulsion.'))
   .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);
