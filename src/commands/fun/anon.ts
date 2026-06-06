import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { AnonMessage } from '../../models/AnonMessage';
import { AnonChannelConfig } from '../../models/AnonChannelConfig';

export const run = async ({ interaction }: CommandProps) => {
   const messageContent = interaction.options.getString('mensaje');

   const channelConfig = await AnonChannelConfig.findOne({
      guildId: interaction.guild?.id,
   });

   if (!channelConfig) {
      await interaction.reply({
         content: 'No hay un canal de mensajes anónimos configurado.',
         ephemeral: true,
      });
      return;
   }

   const existingMessage = await AnonMessage.findOne({
      guildId: interaction.guildId,
      content: messageContent,
   });

   if (existingMessage) {
      await interaction.reply({
         content: `El mensaje "${messageContent}" ya existe.`,
         ephemeral: true,
      });
      return;
   }

   const newAnonMessage = new AnonMessage({
      authorId: interaction.user.id,
      guildId: interaction.guildId,
      content: messageContent,
   });

   await newAnonMessage.save();

   const successEmbed = new EmbedBuilder().setTitle('✅ Éxito').setDescription('Tu mensaje anónimo se ha guardado correctamente.').setColor(0x00ff00);

   await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
   });
};

export const data = new SlashCommandBuilder()
   .setName('anon')
   .setDescription('Envía un mensaje anónimo')
   .addStringOption(option => option.setName('mensaje').setDescription('El mensaje a enviar').setRequired(true));
