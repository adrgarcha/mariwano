import { SlashCommandProps } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      await interaction.deferReply();

      const arabFunnyFrase = "";
      interaction.editReply(`Mejores memes:${arabFunnyFrase}\nTOP 1 🏆:\nTOP 2🥈:\nTOP 3🥉:`);
   },
   data: new SlashCommandBuilder().setName('memeboard').setDescription('Hace un ranking de los memes con mas reacciones de la ultima semana'),
};
