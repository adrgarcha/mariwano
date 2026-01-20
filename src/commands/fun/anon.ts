import { SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { AnonMessageModel } from '../../models/AnonMessage';
import { AnonMessagesModel } from '../../models/AnonMessages';
export const run = async ({ interaction }: CommandProps) => {
   const message = interaction.options.getString('mensaje');

   const query = {
      guildId: interaction.guild?.id,
      anonChannelGuild: interaction.channelId,
   };

   const messageChannel = await AnonMessagesModel.findOne(query);

   if (!messageChannel) {
      await interaction.reply('No hay un canal de mensajes anónimos configurado.');
      return;
   }
   const newAnonMessage = new AnonMessageModel({
      authorId: interaction.user.id,
      guildId: interaction.guildId,
      anonChannelGuild: interaction.channelId,
      content: message,
      date: new Date(),
      published: false,
   });

   const query2 = {
      content: message,
   };

   const messageInDatabase = await AnonMessageModel.findOne(query2);
   if (messageInDatabase) {
      await interaction.reply('El mensaje "' + message + '" ya existe.');
      return;
   } else {
      await newAnonMessage.save();
      await interaction.reply('El mensaje "' + message + '" se ha guardado.');
   }
};

export const data = new SlashCommandBuilder()
   .setName('anon')
   .setDescription('Envía un mensaje anónimo')
   .addStringOption(option => option.setName('mensaje').setDescription('El mensaje a enviar').setRequired(true));
