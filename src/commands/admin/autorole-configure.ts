import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { SlashCommandProps } from 'commandkit';
import { AutoRole } from '../../models/AutoRole';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      if (!interaction.guild) {
         interaction.reply('Solo puedes ejecutar este comando en un servidor.');
         return;
      }

      if (!interaction.memberPermissions?.has('Administrator')) {
         await interaction.reply('Solo los administradores pueden ejecutar este comando.');
         return;
      }

      const targetRoleId = interaction.options.get('role')?.value;

      try {
         await interaction.deferReply({ ephemeral: true });

         let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });
         if (autoRole) {
            if (autoRole.roleId === targetRoleId) {
               await interaction.followUp(`Auto-rol ya se ha configurado para este rol. Para deshabilitarlo use '/autorole-disable'`);
               return;
            }

            autoRole.set({ roleId: targetRoleId });
         } else {
            autoRole = new AutoRole({
               guildId: interaction.guild.id,
               roleId: targetRoleId,
            });
         }
         await autoRole.save();
         await interaction.followUp(`Auto-rol se ha configurado correctamente. Para deshabilitarlo use '/autorole-disable'`);
      } catch (error) {
         console.error(`Hubo un error al configurar el auto-rol: ${error}`);
      }
   },
   data: {
      name: 'autorole-configure',
      description: 'Configurar el auto-rol para este servidor.',
      options: [
         {
            name: 'role',
            description: 'El rol que quieres darle a nuevos usuarios.',
            type: ApplicationCommandOptionType.Role,
            required: true,
         },
      ],
      permissionsRequired: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageRoles],
   },
};
