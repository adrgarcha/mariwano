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

   const subcommand = interaction.options.getSubcommand();

   try {
      await interaction.deferReply({ ephemeral: true });

      if (subcommand === 'configure') {
         const targetRoleId = interaction.options.get('role')?.value;
         let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

         if (autoRole) {
            if (autoRole.roleId === targetRoleId) {
               await interaction.followUp(`Auto-rol ya se ha configurado para este rol. Para deshabilitarlo use '/autorole disable'`);
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
         await interaction.followUp(`Auto-rol se ha configurado correctamente. Para deshabilitarlo use '/autorole disable'`);
      } else if (subcommand === 'disable') {
         const autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });
         if (!autoRole) {
            await interaction.followUp('No hay auto-rol configurado en este servidor.');
            return;
         }
         await autoRole.deleteOne();
         await interaction.followUp('Auto-rol ha sido deshabilitado correctamente.');
      }
   } catch (error) {
      console.error(`Hubo un error con el comando auto-rol: ${error}`);
      await interaction.followUp('Hubo un error al procesar el comando.');
   }
};

export const data = new SlashCommandBuilder()
   .setName('autorole')
   .setDescription('Gestionar el auto-rol del servidor')
   .addSubcommand(subcommand =>
      subcommand
         .setName('configure')
         .setDescription('Configurar el auto-rol para este servidor')
         .addRoleOption(option => option.setName('role').setDescription('El rol que quieres darle a nuevos usuarios').setRequired(true))
   )
   .addSubcommand(subcommand => subcommand.setName('disable').setDescription('Deshabilitar el auto-rol para este servidor'))
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
