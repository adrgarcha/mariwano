import { SlashCommandBuilder } from 'discord.js';
import { arabFunnySentences } from '../../data/arabFunnySentences';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   await interaction.deferReply();

   const arabFunnyFrase = arabFunnySentences[Math.floor(Math.random() * arabFunnySentences.length)];
   interaction.editReply(`${arabFunnyFrase}`);
};

export const data = new SlashCommandBuilder().setName('arabfunny').setDescription('⭕HARAM ALERT⭕');
