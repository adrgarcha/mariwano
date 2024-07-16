import { SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {};

export const data = new SlashCommandBuilder().setName('stats').setDescription('Las estadísticas de tu usuario. (Comando no desarrollado)');
