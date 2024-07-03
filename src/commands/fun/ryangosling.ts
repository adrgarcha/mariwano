import { SlashCommandProps } from 'commandkit';
import { ryanGoslingPhotos } from '../../data/ryanGoslingPhotos';
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      await interaction.reply(ryanGoslingPhotos[Math.floor(Math.random() * ryanGoslingPhotos.length)]);
   },
   data: new SlashCommandBuilder().setName('ryangosling').setDescription('I drive.'),
};
