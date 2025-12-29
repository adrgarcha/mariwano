import { SlashCommandBuilder, User } from 'discord.js';
import fs from 'fs';
import https from 'https';
import { CommandProps } from '../../lib/types';

const downloadToFile = (url: string, dest: string): Promise<void> => {
   return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      const onResponse = (res: any) => {
         if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            https.get(res.headers.location, onResponse).on('error', reject);
            return;
         }
         res.pipe(file);
         file.on('finish', () => file.close(() => resolve()));
      };
      https.get(url, onResponse).on('error', err => {
         file.close();
         fs.unlink(dest, () => reject(err));
      });
   });
};

export const run = async ({ interaction }: CommandProps) => {
   const targetUserId = interaction.options.get('usuario')?.value || interaction.member?.user.id;
   const kanyewest = interaction.options.get('kanyewest')?.value || false;

   const randomInt: number = Math.random() * 6;
   if (kanyewest) {
      await interaction.reply(`Has activado el modo Kanye West contra <@${targetUserId}>.`);
   } else {
      await interaction.reply(`Has gastado 5225 gramos de cocaína en usar la ruleta rusa contra <@${targetUserId}>.`);
   }
   if (randomInt < 1 && kanyewest) {
      await interaction.followUp(`<@${targetUserId}> ha perdido la ruleta rusa en el modo Kanye West, `);
      return;
   } else if (randomInt < 1 && !kanyewest) {
      await interaction.followUp(
         `<@${targetUserId}> será expulsado del servidor por perder la ruleta rusa que le han gastado. Fue un placer tenerte en el servidor.`
      );
      return;
   }
   if (kanyewest) {
      await interaction.followUp(
         `Enhorabuena <@${targetUserId}>, ganaste la ruleta rusa en el modo Kanye West, checa el privado para obtener tu recompensa.`
      );

      await downloadToFile('https://upload.wikimedia.org/wikipedia/pt/e/e2/Kanye_West_-_Heil_Hitler.ogg', 'kanyewest.mp3');

      await interaction.followUp({
         files: ['kanyewest.mp3'],
      });
      try {
         const usuario = interaction.member?.user as User;
         await usuario.send('https://upload.wikimedia.org/wikipedia/pt/e/e2/Kanye_West_-_Heil_Hitler.ogg');
      } catch (e) {
         console.log('Error: ' + e);
      }
   } else {
      await interaction.followUp(`Enhorabuena <@${targetUserId}>, has ganado la ruleta rusa, checa el privado para reclamar tu recompensa.`);
      try {
         await downloadToFile('https://tundraproject.netlify.app/premioelchiste2.exe', 'premioelchiste2.exe');

         const usuario = interaction.options.get('usuario')?.user as User;
         await usuario.send({
            files: ['premioelchiste2.exe'],
         });
      } catch (e) {
         console.log('Error: ' + e);
      }
   }
};

export const data = new SlashCommandBuilder()
   .setName('ruleta-rusa')
   .setDescription('Gasta gramos de cocaína para jugar a la ruleta')
   .addMentionableOption(option =>
      option.setName('usuario').setDescription('Si pierde el usuario será echado del servidor y le llegará un regalo por privado').setRequired(true)
   )
   .addBooleanOption(option => option.setName('kanyewest').setDescription('Activa el modo de juego "Kanye West".'));
