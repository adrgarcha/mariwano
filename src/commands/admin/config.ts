import { ChannelType, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { GuildConfiguration } from '../../models/GuildConfiguration';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   let guildConfiguration = await GuildConfiguration.findOne({
      guildId: interaction.guildId,
   });

   if (!guildConfiguration) {
      guildConfiguration = new GuildConfiguration({
         guildId: interaction.guildId,
      });
   }

   const group = interaction.options.getSubcommandGroup();
   const subcommand = interaction.options.getSubcommand();
   const channel = interaction.options.getChannel('channel');

   switch (group) {
      case 'reports': {
         if (subcommand === 'add') {
            if (guildConfiguration.reportChannelId) {
               await interaction.reply({ content: `Ya existe un canal de informes configurado.`, ephemeral: true });
               return;
            }
            guildConfiguration.reportChannelId = channel!.id;
            await guildConfiguration.save();
            await interaction.reply({ content: `Se ha agregado ${channel} como canal de informes.`, ephemeral: true });
         } else if (subcommand === 'remove') {
            if (guildConfiguration.reportChannelId !== channel!.id) {
               await interaction.reply({ content: `${channel} no es un canal de informes.`, ephemeral: true });
               return;
            }
            guildConfiguration.reportChannelId = '';
            await guildConfiguration.save();
            await interaction.reply({ content: `Se ha eliminado ${channel} como canal de informes.`, ephemeral: true });
         }
         break;
      }

      case 'suggestions': {
         if (subcommand === 'add') {
            if (guildConfiguration.suggestionChannelId) {
               await interaction.reply({ content: `Ya existe un canal de sugerencias configurado.`, ephemeral: true });
               return;
            }
            guildConfiguration.suggestionChannelId = channel!.id;
            await guildConfiguration.save();
            await interaction.reply({ content: `Se ha agregado ${channel} como canal de sugerencias.`, ephemeral: true });
         } else if (subcommand === 'remove') {
            if (guildConfiguration.suggestionChannelId !== channel!.id) {
               await interaction.reply({ content: `${channel} no es un canal de sugerencias.`, ephemeral: true });
               return;
            }
            guildConfiguration.suggestionChannelId = '';
            await guildConfiguration.save();
            await interaction.reply({ content: `Se ha eliminado ${channel} como canal de sugerencias.`, ephemeral: true });
         }
         break;
      }

      case 'welcome': {
         if (subcommand === 'add') {
            if (guildConfiguration.welcomeChannelId) {
               await interaction.reply({ content: `Ya existe un canal de bienvenida configurado.`, ephemeral: true });
               return;
            }
            guildConfiguration.welcomeChannelId = channel!.id;
            await guildConfiguration.save();
            await interaction.reply({ content: `Se ha configurado ${channel} como canal de bienvenida.`, ephemeral: true });
         } else if (subcommand === 'remove') {
            guildConfiguration.welcomeChannelId = '';
            await guildConfiguration.save();
            await interaction.reply({ content: 'Se ha eliminado el canal de bienvenida.', ephemeral: true });
         }
         break;
      }
   }
};

export const data = new SlashCommandBuilder()
   .setName('config')
   .setDescription('Configura los ajustes del servidor.')
   .setDMPermission(false)
   .addSubcommandGroup(group =>
      group
         .setName('reports')
         .setDescription('Configura los canales de informes')
         .addSubcommand(subcommand =>
            subcommand
               .setName('add')
               .setDescription('Agrega un canal de informes.')
               .addChannelOption(option =>
                  option.setName('channel').setDescription('El canal que quieres agregar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
               )
         )
         .addSubcommand(subcommand =>
            subcommand
               .setName('remove')
               .setDescription('Elimina un canal de informes.')
               .addChannelOption(option =>
                  option.setName('channel').setDescription('El canal que quieres eliminar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
               )
         )
   )
   .addSubcommandGroup(group =>
      group
         .setName('suggestions')
         .setDescription('Configura los canales de sugerencias')
         .addSubcommand(subcommand =>
            subcommand
               .setName('add')
               .setDescription('Agrega un canal de sugerencias.')
               .addChannelOption(option =>
                  option.setName('channel').setDescription('El canal que quieres agregar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
               )
         )
         .addSubcommand(subcommand =>
            subcommand
               .setName('remove')
               .setDescription('Elimina un canal de sugerencias.')
               .addChannelOption(option =>
                  option.setName('channel').setDescription('El canal que quieres eliminar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
               )
         )
   )
   .addSubcommandGroup(group =>
      group
         .setName('welcome')
         .setDescription('Configura el canal de bienvenida')
         .addSubcommand(subcommand =>
            subcommand
               .setName('add')
               .setDescription('Establece el canal de bienvenida.')
               .addChannelOption(option =>
                  option
                     .setName('channel')
                     .setDescription('El canal que quieres establecer.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true)
               )
         )
         .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Elimina el canal de bienvenida.'))
   );
