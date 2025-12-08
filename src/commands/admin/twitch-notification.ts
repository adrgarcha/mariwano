import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { TwitchNotificationConfig } from '../../models/TwitchNotificationConfig';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });
      const subcommand = interaction.options.getSubcommand();
      const twitchChannelName = interaction.options.getString('twitch-channel-name');
      const notificationChannel = interaction.options.getChannel('notification-channel');

      switch (subcommand) {
         case 'setup': {
            const existingConfig = await TwitchNotificationConfig.findOne({
               twitchChannelName: twitchChannelName?.toLowerCase(),
               notificationChannelId: notificationChannel!.id,
            });

            if (existingConfig) {
               await interaction.editReply('Ya existe una configuración de notificaciones para ese canal de Twitch.');
               return;
            }

            const newConfig = new TwitchNotificationConfig({
               twitchChannelName: twitchChannelName?.toLowerCase(),
               notificationChannelId: notificationChannel!.id,
               guildId: interaction.guildId,
            });

            await newConfig.save();
            await interaction.editReply('✅ Se configuró correctamente las notificaciones de Twitch para ese canal.');
            break;
         }

         case 'remove': {
            const twitchConfig = await TwitchNotificationConfig.findOne({
               twitchChannelName: twitchChannelName?.toLowerCase(),
               notificationChannelId: notificationChannel!.id,
            });

            if (!twitchConfig) {
               await interaction.editReply(
                  'No existe una configuración de notificaciones para ese canal de Twitch o el nombre del canal no es correcto.'
               );
               return;
            }

            await TwitchNotificationConfig.findOneAndDelete({ _id: twitchConfig._id });
            await interaction.editReply('❌ Se eliminó la configuración de notificaciones de Twitch para ese canal.');
            break;
         }

         case 'list': {
            const configs = await TwitchNotificationConfig.find({ guildId: interaction.guildId });

            if (!configs.length) {
               await interaction.editReply('No hay configuraciones de notificaciones de Twitch en este servidor.');
               return;
            }

            const configList = configs.map(config => `• **${config.twitchChannelName}** → <#${config.notificationChannelId}>`).join('\n');

            await interaction.editReply(`📺 **Canales de Twitch configurados:**\n${configList}`);
            break;
         }
      }
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando "twitch-notification": ${error}`);
      await interaction.editReply('Hubo un error al procesar el comando. Inténtalo de nuevo más tarde.');
   }
};

export const data = new SlashCommandBuilder()
   .setName('twitch-notification')
   .setDescription('Gestiona las notificaciones de Twitch.')
   .setDMPermission(false)
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addSubcommand(subcommand =>
      subcommand
         .setName('setup')
         .setDescription('Configura las notificaciones para un canal de Twitch.')
         .addStringOption(option => option.setName('twitch-channel-name').setDescription('El nombre del canal de Twitch.').setRequired(true))
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
         .setDescription('Elimina la configuración de notificaciones para un canal de Twitch.')
         .addStringOption(option => option.setName('twitch-channel-name').setDescription('El nombre del canal de Twitch.').setRequired(true))
         .addChannelOption(option =>
            option
               .setName('notification-channel')
               .setDescription('El canal donde se dejarán de enviar notificaciones.')
               .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
               .setRequired(true)
         )
   )
   .addSubcommand(subcommand => subcommand.setName('list').setDescription('Muestra los canales de Twitch configurados en este servidor.'));
