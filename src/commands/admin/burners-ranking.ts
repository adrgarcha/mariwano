import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { BurnSettings } from '../../models/BurnSettings';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   const subcommand = interaction.options.getSubcommand();
   const guildId = interaction.guild.id;

   try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      switch (subcommand) {
         case 'configure': {
            const channel = interaction.options.getChannel('channel', true);
            const role = interaction.options.getRole('role', true);

            await BurnSettings.findOneAndUpdate({ guildId }, { channelId: channel.id, roleId: role.id }, { upsert: true, new: true });

            await interaction.editReply(
               `✅ Ranking de quemadores configurado. Se publicará en <#${channel.id}> y el rol <@&${role.id}> se asignará al top derrochador semanal.`
            );
            break;
         }
         case 'disable': {
            const existing = await BurnSettings.findOne({ guildId });

            if (!existing) {
               await interaction.editReply('No hay ningún ranking de quemadores configurado en este servidor.');
               return;
            }

            await existing.deleteOne();
            await interaction.editReply('✅ Ranking de quemadores deshabilitado correctamente.');
            break;
         }
      }
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'burners-ranking': ${error}`);
      await interaction.editReply('Hubo un error al procesar el comando.');
   }
};

export const data = new SlashCommandBuilder()
   .setName('burners-ranking')
   .setDescription('Configurar el ranking semanal de quemadores de gramos.')
   .setContexts([InteractionContextType.Guild])
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addSubcommand(subcommand =>
      subcommand
         .setName('configure')
         .setDescription('Configurar el canal y rol del ranking semanal de quemadores.')
         .addChannelOption(option => option.setName('channel').setDescription('Canal donde se publicará el ranking semanal.').setRequired(true))
         .addRoleOption(option => option.setName('role').setDescription('Rol que se asignará al mayor quemador de la semana.').setRequired(true))
   )
   .addSubcommand(subcommand => subcommand.setName('disable').setDescription('Deshabilitar el ranking semanal de quemadores.'));
