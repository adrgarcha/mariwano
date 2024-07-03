import { SlashCommandProps } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';
import { imagenesDurisimas } from '../../data/imagenesDurisimas';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      await interaction.reply(imagenesDurisimas[Math.floor(Math.random() * imagenesDurisimas.length)]);
   },
   data: new SlashCommandBuilder().setName('imagendura').setDescription('Spawnea una imagen mas dura el pan al dia siguiente.'),
};
