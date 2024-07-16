import { SlashCommandBuilder } from 'discord.js';
import { imagenesDurisimas } from '../../data/imagenesDurisimas';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   await interaction.reply(imagenesDurisimas[Math.floor(Math.random() * imagenesDurisimas.length)]);
};

export const data = new SlashCommandBuilder().setName('imagendura').setDescription('Spawnea una imagen mas dura el pan al dia siguiente.');
