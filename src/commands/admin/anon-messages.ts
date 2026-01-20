import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { AnonMessagesModel } from '../../models/AnonMessages';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   if (!interaction.guild) {
      interaction.reply('Solo puedes ejecutar este comando en un servidor.');
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      const channel = interaction.options.getChannel('canal');
      const subcommand = interaction.options.getSubcommand();

      const channelExists = await AnonMessagesModel.exists({
         guildId: interaction.guildId,
         anonChannelGuild: channel?.id,
      });

      switch (subcommand) {
         case 'setup':
            if (channelExists) {
               await interaction.editReply(`Ya hay un canal de mensajes anónimos configurado.`);
               return;
            }

            await AnonMessagesModel.create({
               guildId: interaction.guildId,
               anonChannelGuild: channel?.id,
            });

            await interaction.editReply(`Se ha agregado ${channel} como canal de mensajes anónimos.`);
            return;
         case 'disable':
            if (!channelExists) {
               await interaction.editReply(`No se ha configurado un canal de mensajes anónimos.`);
               return;
            }

            await AnonMessagesModel.findOneAndDelete({
               guildId: interaction.guildId,
            });

            await interaction.editReply(`Se ha eliminado ${channel} como canal de mensajes anónimos.`);
            return;
         default:
            return;
      }
   } catch (error) {
      console.error(`Hubo un error al configurar los mensajes anónimos: ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('anon-messages')
   .setDescription('Administra los mensajes anónimos')
   .addSubcommand(subcommand =>
      subcommand
         .setName('setup')
         .setDescription(`Configurar el canal de mensajes anónimos`)
         .addChannelOption(option =>
            option.setName('canal').setDescription('Canal de mensajes anónimos a configurar').addChannelTypes(ChannelType.GuildText).setRequired(true)
         )
   )
   .addSubcommand(subcommand =>
      subcommand
         .setName('disable')
         .setDescription('Elimina el canal de mensajes anónimos')
         .addChannelOption(option =>
            option.setName('canal').setDescription('El canal que quieres eliminar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
         )
   )
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
