import { SlashCommandProps } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {},
   data: new SlashCommandBuilder().setName('stats').setDescription('Las estadísticas de tu usuario. (Comando no desarrollado)'),
};
