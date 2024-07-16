import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply('Sólo puedes ejecutar este comando en un servidor.');
      return;
   }

   try {
      const mentionable = interaction.options.get('target-user')?.value as string;
      const duration = interaction.options.get('duration')?.value as string;
      const reason = (interaction.options.get('reason')?.value || 'No se proporcionó ninguna razón.') as string | undefined;

      await interaction.deferReply();

      const targetUser = await interaction.guild.members.fetch(mentionable);
      if (!targetUser) {
         await interaction.editReply(`El usuario ${targetUser} no existe en este servidor.`);
         return;
      }

      if (targetUser.user.bot) {
         await interaction.editReply(`No puedo hacer timeout a un bot.`);
         return;
      }

      const msDuration = ms(duration);
      if (isNaN(msDuration)) {
         await interaction.editReply(`Proporciona un valor valido de timeout.`);
         return;
      }

      if (msDuration < 5000 || msDuration > 2.419e9) {
         // Timeout menor que 5 segundos y mayor que 28 dias.
         await interaction.editReply(`La duracion del timeout no puede ser menor a 5 segundos o mayor a 28 dias.`);
         return;
      }

      const targetUserRolePosition = targetUser.roles.highest.position;
      const requestUser = interaction.member as GuildMember;
      const requestUserRolePosition = requestUser.roles.highest.position;
      const botRolePosition = interaction.guild.members.me!.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition) {
         await interaction.editReply(`No puedes hacer timeout al usuario ${targetUser} porque tiene el mismo o superior rol al tuyo.`);
         return;
      }

      if (targetUserRolePosition >= botRolePosition) {
         await interaction.editReply(`No puedo hacer timeout al usuario ${targetUser} porque tiene el mismo o superior rol que el mio.`);
         return;
      }

      const { default: prettysMs } = await import('pretty-ms');

      if (targetUser.isCommunicationDisabled()) {
         await targetUser.timeout(msDuration, reason);
         await interaction.editReply(
            `El timeout del usuario ${targetUser} ha sido aumentado a ${prettysMs(msDuration, {
               verbose: true,
            })}.\nRazon: ${reason}.\n👏 Enhorabuena!`
         );
         return;
      }

      await targetUser.timeout(msDuration, reason);

      await interaction.editReply(
         `El usuario ${targetUser} le han realizado un pedazo de timeout de ${prettysMs(msDuration, { verbose: true })}.\nRazon: ${reason}.`
      );
   } catch (error) {
      console.error(`Hubo un error al hacer timeout: ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('timeout')
   .setDescription('Realiza un timeout a un miembro.')
   .addMentionableOption(option => option.setName('target-user').setDescription('El miembro que vayas a hacer timeout.').setRequired(true))
   .addStringOption(option => option.setName('duration').setDescription('La duracion del timeout (30m, 1h, 1 day).').setRequired(true))
   .addStringOption(option => option.setName('reason').setDescription('La razon del timeout.'))
   .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
