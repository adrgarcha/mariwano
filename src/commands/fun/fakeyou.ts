import { SlashCommandBuilder } from 'discord.js';
import { Client } from 'fakeyou.ts';
import fs from 'fs';
import { CommandProps } from '../../lib/types';

const client = new Client();
const voices: string[] = [];

(async () => {
   await client
      .fetchTtsModels()
      .then(models =>
         models.forEach(model => {
            voices.push(model.creatorDisplayName);
         })
      )
      .catch(error => console.error(`Ha ocurrido un error al cargar las voces: ${error}`));
})();

export const run = async ({ interaction }: CommandProps) => {
   try {
      await interaction.deferReply({ ephemeral: true });

      const textoAVoz = interaction.options.getString('textardo') as string;
      const tipoDeVoz = interaction.options.getString('voz')!.toLowerCase();
      const vocesProhibidas = ['xokas'];
      if (vocesProhibidas.includes(tipoDeVoz.toLowerCase())) {
         interaction.editReply('No puedes utilizar esa voz, lo siento.');
      }

      await client.login({
         username: 'porrazo',
         password: 'code100Todo',
      });

      let model = await client.fetchTtsModelByName(tipoDeVoz);

      if (!model) {
         await interaction.followUp({ content: 'Modelo no encontrado.', ephemeral: true });
         return;
      }
      await interaction.followUp({ content: 'Cargando el audio...', ephemeral: true });

      const inference = await model.infer(textoAVoz);

      if (!inference) {
         await interaction.followUp({ content: 'Ha ocurrido un error al transformar el texto a audio.', ephemeral: true });
         return;
      }

      const audioBuffer = await inference.toBuffer();
      fs.writeFileSync('tts_audio.mp3', audioBuffer!);

      await interaction.followUp({
         files: ['tts_audio.mp3'],
      });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'fakeyou': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('fakeyou')
   .setDescription('Genera un audio con la voz de tu youtuber favorito')
   .addStringOption(option =>
      option
         .setName('voz')
         .setDescription('Pon el nombre de la persona que quieres que recite el texto')
         .setRequired(true)
         .addChoices(voices.map(voice => ({ name: voice, value: voice })))
   )
   .addStringOption(option => option.setName('textardo').setDescription('Escribe el texto que quieres convertir en audio.').setRequired(true));
