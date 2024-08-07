import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { NotificationConfig } from '../../models/NotificationConfig';
import { fetchYoutubeChannelUploads } from '../../utils/fetchYoutube';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply('Solo puedes ejecutar este comando en un servidor.');
      return;
   }

   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      const youtubeChannelId = interaction.options.getString('youtube-channel-id')!;
      const notificationChannel = interaction.options.getChannel('notification-channel');
      const customMessage = interaction.options.getString('custom-message');

      const duplicateExists = await NotificationConfig.exists({
         notificationChannelId: notificationChannel!.id,
         youtubeChannelId: youtubeChannelId,
      });

      if (duplicateExists) {
         interaction.editReply('Ya existe una configuración para notificaciones en este canal. Puedes usar `notification-remove` para eliminarla.');
         return;
      }

      const uploads = await fetchYoutubeChannelUploads(youtubeChannelId).catch(() => {
         interaction.editReply('Hubo un error al obtener el canal. Asegúrate de que el ID del canal sea correcto.');
      });

      if (!uploads?.length) return;

      const notificationConfig = new NotificationConfig({
         guildId: interaction.guild.id,
         notificationChannelId: notificationChannel!.id,
         youtubeChannelId: youtubeChannelId,
         customMessage: customMessage,
         lastCheckedVideo: null,
      });

      const lastVideo = uploads[0];
      notificationConfig.lastCheckedVideo = {
         videoId: lastVideo.contentDetails?.videoId!,
         publishedDate: new Date(lastVideo.contentDetails?.videoPublishedAt!),
      };

      const channelName = lastVideo.snippet?.channelTitle;
      notificationConfig
         .save()
         .then(() => {
            const youtubeEmbed = new EmbedBuilder()
               .setTitle('✅ Canal de YouTube configurado correctamente.')
               .setDescription(`El canal ${notificationChannel} ahora podrá recibir notificaciones de ${channelName}.`)
               .setTimestamp();

            interaction.editReply({ embeds: [youtubeEmbed] });
         })
         .catch(() => {
            interaction.editReply('Hubo un error al guardar la configuración. Inténtalo de nuevo más tarde.');
         });
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando "notification-setup": ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('notification-setup')
   .setDescription('Configura un canal de notificaciones de YouTube.')
   .setDMPermission(false)
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addStringOption(option => option.setName('youtube-channel-id').setDescription('ID del canal de YouTube.').setRequired(true))
   .addChannelOption(option =>
      option
         .setName('notification-channel')
         .setDescription('Canal de notificaciones.')
         .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
         .setRequired(true)
   )
   .addStringOption(option => option.setName('custom-message').setDescription('Plantillas: {videoTitle} {videoUrl} {channelName} {channelUrl}'));
