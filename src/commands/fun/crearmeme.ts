import { SlashCommandBuilder } from 'discord.js';
import Jimp from 'jimp';
import { CommandProps } from '../../lib/types';

const right = (text: string, n: number) => text.slice(-n);

export const run = async ({ interaction }: CommandProps) => {
   try {
      const textoSuperior = interaction.options.getString('textoarriba');
      const textoInferior = interaction.options.getString('textoabajo');
      const url = interaction.options.getString('urlimagen') as string;
      const efecto = interaction.options.get('efectos')?.value;

      const imageObject = await Jimp.read(url);
      if (efecto) {
         try {
            switch (efecto) {
               case 1:
                  imageObject.flip(false, true);
                  break;
               case 2:
                  imageObject.blur(5);
                  break;
               case 3:
                  imageObject.fishEye();
                  break;
               case 4:
                  imageObject.invert();
                  break;
               case 5:
                  imageObject.rotate(90);
                  break;
            }
         } catch (err) {
            console.error(err);
         }
      }
      const font = await Jimp.loadFont('./src/utils/roboto.fnt');

      imageObject.print(
         font,
         0,
         0,
         {
            text: textoSuperior,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP,
         },
         imageObject.getWidth(),
         imageObject.getHeight()
      );

      imageObject.print(
         font,
         0,
         0,
         {
            text: textoInferior,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
         },
         imageObject.getWidth(),
         imageObject.getHeight()
      );

      var memeBuffer;
      if (url.includes('.gif') || right(url, 4) === '.gif') {
         memeBuffer = await imageObject.getBufferAsync(Jimp.MIME_GIF);
      } else {
         memeBuffer = await imageObject.getBufferAsync(Jimp.MIME_PNG);
      }
      await interaction.reply({ files: [memeBuffer] });
   } catch (error) {
      await interaction.reply(`Parece que ha ocurrido un error al crear el meme. Intenta poner una URL válida que tenga un formato de imagen.`);
      console.error(`Ha ocurrido un error con el comando 'crearmeme': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('crearmeme')
   .setDescription('Adhiere un texto arriba y abajo de una foto')
   .addStringOption(option => option.setName('textoarriba').setDescription('Texto de arriba de la foto').setMaxLength(75).setRequired(true))
   .addStringOption(option => option.setName('textoabajo').setDescription('Texto de abajo de la foto').setMaxLength(75).setRequired(true))
   .addStringOption(option => option.setName('urlimagen').setDescription('URL de la imagen').setRequired(true))
   .addIntegerOption(option =>
      option
         .setName('efectos')
         .setDescription('Añadir efectos a la imagen')
         .addChoices([
            {
               name: 'invertir',
               value: 1,
            },
            {
               name: 'desenfocar',
               value: 2,
            },
            {
               name: 'esferizar',
               value: 3,
            },
            {
               name: 'invertir_color',
               value: 4,
            },
            {
               name: 'rotar',
               value: 5,
            },
         ])
   );
