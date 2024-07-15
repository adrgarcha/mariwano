import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { AutoRole } from '../../models/AutoRole';

export const run = async ({ interaction }: CommandProps) => {
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
};

export const data = new SlashCommandBuilder()
   .setName('autorole-configure')
   .setDescription('Configurar el auto-rol para este servidor.')
   .addRoleOption(option => option.setName('role').setDescription('El rol que quieres darle a nuevos usuarios.').setRequired(true))
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
