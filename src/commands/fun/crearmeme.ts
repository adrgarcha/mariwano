import { SlashCommandBuilder } from 'discord.js';
import { HorizontalAlign, Jimp, loadFont, VerticalAlign } from 'jimp';
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
                  imageObject.flip({ horizontal: false, vertical: true });
                  break;
               case 2:
                  imageObject.blur(5);
                  break;
               case 3:
                  imageObject.fisheye();
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
      const font = await loadFont('./src/utils/roboto.fnt');

      imageObject.print({
         font,
         x: 0,
         y: 0,
         text: {
            text: textoSuperior!,
            alignmentX: HorizontalAlign.CENTER,
            alignmentY: VerticalAlign.TOP,
         },
         maxWidth: imageObject.width,
         maxHeight: imageObject.height,
      });

      imageObject.print({
         font,
         x: 0,
         y: 0,
         text: {
            text: textoInferior!,
            alignmentX: HorizontalAlign.CENTER,
            alignmentY: VerticalAlign.BOTTOM,
         },
         maxWidth: imageObject.width,
         maxHeight: imageObject.height,
      });

      let memeBuffer;
      if (url.includes('.gif') || right(url, 4) === '.gif') {
         memeBuffer = await imageObject.getBuffer('image/gif');
      } else {
         memeBuffer = await imageObject.getBuffer('image/png');
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
