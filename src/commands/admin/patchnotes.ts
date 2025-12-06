import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { PatchNotesConfig } from '../../models/PatchNotesConfig';
import { fetchLatestRelease } from '../../utils/github';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({ content: 'Solo puedes ejecutar este comando en un servidor.', ephemeral: true });
      return;
   }

   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   const subcommand = interaction.options.getSubcommand();

   switch (subcommand) {
      case 'set': {
         await interaction.deferReply({ ephemeral: true });

         const channel = interaction.options.getChannel('channel') as TextChannel;

         const latestRelease = await fetchLatestRelease();

         await PatchNotesConfig.findOneAndUpdate(
            { guildId: interaction.guildId },
            { channelId: channel.id, lastReleaseId: latestRelease?.id ? String(latestRelease.id) : null },
            { upsert: true, new: true }
         );

         await interaction.editReply(`El canal para los anuncios de notas de parche se ha establecido en <#${channel.id}>.`);

         if (latestRelease) {
            const releaseDate = new Date(latestRelease.publishedAt).toLocaleDateString('es-ES', {
               day: 'numeric',
               month: 'long',
               year: 'numeric',
            });

            const truncatedBody = latestRelease.body.length > 4000 ? latestRelease.body.substring(0, 4000) + '...' : latestRelease.body;

            const embed = new EmbedBuilder()
               .setTitle(`📌 Última versión disponible – ${latestRelease.name}`)
               .setDescription(truncatedBody)
               .setColor(0x5865f2)
               .setURL(latestRelease.htmlUrl)
               .addFields({ name: '🗓️ Fecha de lanzamiento', value: releaseDate, inline: true })
               .setFooter({ text: 'A partir de ahora recibirás las notas de parche de las nuevas versiones.' })
               .setTimestamp(new Date(latestRelease.publishedAt));

            await channel.send({ content: '@everyone', embeds: [embed] });
         }

         return;
      }
      case 'unset': {
         await interaction.deferReply({ ephemeral: true });

         const deletedConfig = await PatchNotesConfig.findOneAndDelete({ guildId: interaction.guildId });

         if (!deletedConfig) {
            await interaction.editReply('No había un canal de notas de parche configurado.');
            return;
         }

         await interaction.editReply('Los anuncios de notas de parche han sido desactivados.');
         return;
      }
      default:
         await interaction.reply({ content: 'Subcomando no reconocido.', ephemeral: true });
   }
};

export const data = new SlashCommandBuilder()
   .setName('patchnotes')
   .setDescription('Establece o desactiva el canal para los anuncios de notas de parche.')
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addSubcommand(subcommand =>
      subcommand
         .setName('set')
         .setDescription('Establece el canal para los anuncios de notas de parche.')
         .addChannelOption(option =>
            option
               .setName('channel')
               .setDescription('El canal para enviar las notas de parche.')
               .addChannelTypes(ChannelType.GuildText)
               .setRequired(true)
         )
   )
   .addSubcommand(subcommand => subcommand.setName('unset').setDescription('Desactiva los anuncios de notas de parche.'));
