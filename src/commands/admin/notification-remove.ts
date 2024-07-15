import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { NotificationConfig } from '../../models/NotificationConfig';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      const youtubeChannelId = interaction.options.getString('youtube-channel-id');
      const notificationChannel = interaction.options.getChannel('notification-channel');

      const youtubeChannel = await NotificationConfig.findOne({
         youtubeChannelId: youtubeChannelId,
         notificationChannelId: notificationChannel!.id,
      });

      if (!youtubeChannel) {
         interaction.editReply('No existe una configuración de notificaciones para ese canal o el id del canal no es correcto.');
         return;
      }

      NotificationConfig.findOneAndDelete({ _id: youtubeChannel._id })
         .then(() => {
            interaction.editReply('❌ Se eliminó la configuración de notificaciones para ese canal.');
         })
         .catch(() => {
            interaction.editReply('Hubo un error al eliminar la configuración de notificaciones. Inténtalo de nuevo más tarde');
         });
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando "notification-remove": ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('notification-remove')
   .setDescription('Elimina la configuración de notificaciones para un canal.')
   .setDMPermission(false)
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addStringOption(option => option.setName('youtube-channel-id').setDescription('El ID del canal de YouTube.').setRequired(true))
   .addChannelOption(option =>
      option
         .setName('notification-channel')
         .setDescription('El canal donde se dejarán de enviar notificaciones.')
         .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
         .setRequired(true)
   );
