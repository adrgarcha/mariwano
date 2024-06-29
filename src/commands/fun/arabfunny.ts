import { SlashCommandProps } from 'commandkit';
import { arabFunnySentences } from '../../data/arabFunnySentences';
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      await interaction.deferReply();

      const arabFunnyFrase = arabFunnySentences[Math.floor(Math.random() * arabFunnySentences.length)];
      interaction.editReply(`${arabFunnyFrase}`);
   },
   data: new SlashCommandBuilder().setName('arabfunny').setDescription('⭕HARAM ALERT⭕'),
};
