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
      const subcommand = interaction.options.getSubcommand();
      const youtubeChannelId = interaction.options.getString('youtube-channel-id');
      const notificationChannel = interaction.options.getChannel('notification-channel');

      switch (subcommand) {
         case 'setup': {
            const existingConfig = await NotificationConfig.findOne({
               youtubeChannelId: youtubeChannelId,
               notificationChannelId: notificationChannel!.id,
            });

            if (existingConfig) {
               await interaction.editReply('Ya existe una configuración de notificaciones para ese canal.');
               return;
            }

            const newConfig = new NotificationConfig({
               youtubeChannelId: youtubeChannelId,
               notificationChannelId: notificationChannel!.id,
               guildId: interaction.guildId,
            });

            await newConfig.save();
            await interaction.editReply('✅ Se configuró correctamente las notificaciones para ese canal.');
            break;
         }

         case 'remove': {
            const youtubeChannel = await NotificationConfig.findOne({
               youtubeChannelId: youtubeChannelId,
               notificationChannelId: notificationChannel!.id,
            });

            if (!youtubeChannel) {
               await interaction.editReply('No existe una configuración de notificaciones para ese canal o el id del canal no es correcto.');
               return;
            }

            await NotificationConfig.findOneAndDelete({ _id: youtubeChannel._id });
            await interaction.editReply('❌ Se eliminó la configuración de notificaciones para ese canal.');
            break;
         }
      }
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando "notification": ${error}`);
      await interaction.editReply('Hubo un error al procesar el comando. Inténtalo de nuevo más tarde.');
   }
};

export const data = new SlashCommandBuilder()
   .setName('notification')
   .setDescription('Gestiona las notificaciones de YouTube.')
   .setDMPermission(false)
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addSubcommand(subcommand =>
      subcommand
         .setName('setup')
         .setDescription('Configura las notificaciones para un canal de YouTube.')
         .addStringOption(option => option.setName('youtube-channel-id').setDescription('El ID del canal de YouTube.').setRequired(true))
         .addChannelOption(option =>
            option
               .setName('notification-channel')
               .setDescription('El canal donde se enviarán las notificaciones.')
               .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
               .setRequired(true)
         )
   )
   .addSubcommand(subcommand =>
      subcommand
         .setName('remove')
         .setDescription('Elimina la configuración de notificaciones para un canal.')
         .addStringOption(option => option.setName('youtube-channel-id').setDescription('El ID del canal de YouTube.').setRequired(true))
         .addChannelOption(option =>
            option
               .setName('notification-channel')
               .setDescription('El canal donde se dejarán de enviar notificaciones.')
               .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
               .setRequired(true)
         )
   );
