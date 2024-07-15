import { SlashCommandBuilder } from 'discord.js';
import { frasesJoker } from '../../data/frasesJoker';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   await interaction.deferReply();

   const fraseAgregada = interaction.options.get('add')?.value as string;
   const frases = interaction.options.get('all')?.value;

   if (fraseAgregada) {
      frasesJoker.push(fraseAgregada);
      interaction.editReply(`Se ha agregado la frase ${fraseAgregada}.`);
      return;
   }

   if (frases) {
      if (!interaction.memberPermissions?.has('Administrator')) {
         await interaction.reply('Solo los administradores pueden ejecutar este comando.');
         return;
      }

      interaction.editReply(frasesJoker.join('\n'));
      return;
   }

   const fraseJoker = frasesJoker[Math.floor(Math.random() * frasesJoker.length)];
   interaction.editReply(`${fraseJoker}`);
};

export const data = new SlashCommandBuilder()
   .setName('frasejoker')
   .setDescription('Dropea una frase aleatoria que diría el joker')
   .addStringOption(option => option.setName('add').setDescription('Añade una frase a la lista de frases.').setRequired(false))
   .addBooleanOption(option => option.setName('all').setDescription('Muestra todas las frases (solo admin)').setRequired(false));
