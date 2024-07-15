import { SlashCommandBuilder } from 'discord.js';
import { ryanGoslingPhotos } from '../../data/ryanGoslingPhotos';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   await interaction.reply(ryanGoslingPhotos[Math.floor(Math.random() * ryanGoslingPhotos.length)]);
};

export const data = new SlashCommandBuilder().setName('ryangosling').setDescription('I drive.');
