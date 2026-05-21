import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { AnonChannelConfig } from '../../models/AnonChannelConfig';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
         content: 'Solo los administradores pueden ejecutar este comando.',
         ephemeral: true,
      });
      return;
   }

   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      const channel = interaction.options.getChannel('canal');
      const subcommand = interaction.options.getSubcommand();

      const existingConfig = await AnonChannelConfig.findOne({ guildId: interaction.guildId });

      switch (subcommand) {
         case 'setup': {
            if (existingConfig) {
               const embed = new EmbedBuilder()
                  .setTitle('❌ Error')
                  .setDescription(`Ya hay un canal configurado: <#${existingConfig.channelId}>`)
                  .setColor(0xff0000);
               await interaction.editReply({ embeds: [embed] });
               return;
            }

            await AnonChannelConfig.create({
               guildId: interaction.guildId,
               channelId: channel?.id,
            });

            const setupEmbed = new EmbedBuilder()
               .setTitle('✅ Éxito')
               .setDescription(`Canal <#${channel?.id}> configurado correctamente.`)
               .setColor(0x00ff00);
            await interaction.editReply({ embeds: [setupEmbed] });
            return;
         }

         case 'disable': {
            if (!existingConfig) {
               const embed = new EmbedBuilder()
                  .setTitle('❌ Error')
                  .setDescription('No hay ningún canal configurado.')
                  .setColor(0xff0000);
               await interaction.editReply({ embeds: [embed] });
               return;
            }

            await AnonChannelConfig.findOneAndDelete({ guildId: interaction.guildId });

            const disableEmbed = new EmbedBuilder()
               .setTitle('✅ Éxito')
               .setDescription('Canal desconfigurado correctamente.')
               .setColor(0x00ff00);
            await interaction.editReply({ embeds: [disableEmbed] });
            return;
         }

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
         .setDescription('Configurar el canal de mensajes anónimos')
         .addChannelOption(option =>
            option.setName('canal').setDescription('Canal de mensajes anónimos a configurar').addChannelTypes(ChannelType.GuildText).setRequired(true)
         )
   )
   .addSubcommand(subcommand => subcommand.setName('disable').setDescription('Elimina el canal de mensajes anónimos'))
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
