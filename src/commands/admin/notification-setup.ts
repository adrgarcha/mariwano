import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import Parser from 'rss-parser';
import { CommandProps } from '../../lib/types';
import { NotificationConfig } from '../../models/NotificationConfig';

const parser = new Parser();

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

      const youtubeChannelId = interaction.options.getString('youtube-channel-id');
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

      const youtubeRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`;
      const feed = await parser.parseURL(youtubeRssUrl).catch(error => {
         interaction.editReply('Hubo un error al obtener el canal. Asegúrate de que el ID del canal sea correcto.');
      });

      if (!feed) return;

      const channelName = feed.title;

      const notificationConfig = new NotificationConfig({
         guildId: interaction.guild.id,
         notificationChannelId: notificationChannel!.id,
         youtubeChannelId: youtubeChannelId,
         customMessage: customMessage,
         lastCheckedVideo: null,
      });

      if (feed.items.length) {
         const lastVideo = feed.items[0];

         notificationConfig.lastCheckedVideo = {
            videoId: lastVideo.id.split(':')[2],
            publishedDate: new Date(lastVideo.pubDate!),
         };
      }

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
